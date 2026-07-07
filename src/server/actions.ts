// src/server/actions.ts
import { HttpError } from 'wasp/server';
import { emailSender } from 'wasp/server/email';
import crypto from 'node:crypto';

type OnboardingArgs = {
  nomEntreprise: string;
  commune: string;
};

type CreateGuichetArgs = {
  nomGuichet: string;
  typeGuichet: string;
  id_agence: number;
};

export const completeOnboarding = async (args: OnboardingArgs, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Non authentifié');
  }

  const { nomEntreprise, commune } = args;

  if (!nomEntreprise || !commune) {
    throw new HttpError(400, "Le nom de l'entreprise et la commune sont requis.");
  }

  // --- GARDE DE SÉCURITÉ SaaS ---
  // Vérification : l'utilisateur n'a-t-il déjà une agence configurée ?
  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
    include: { agence: true }
  });

  // Si l'utilisateur a déjà un id_agence, on bloque la création
  if (user?.id_agence !== null && user?.id_agence !== undefined) {
    throw new HttpError(400, 'Votre compte est déjà configuré avec une entreprise.');
  }
  // --------------------------------

  const updatedUser = await context.entities.User.update({
    where: { id: context.user.id },
    data: {
      role: 'DIRECTION',
      agence: {
        create: {
          nom_agence: `Siège ${nomEntreprise}`,
          commune,
          entreprise: {
            create: {
              nom_entreprise: nomEntreprise,
            }
          }
        }
      }
    },
    include: {
      agence: true
    }
  });

  return updatedUser;
};

export const createGuichet = async (args: CreateGuichetArgs, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Non authentifié');
  }

  const { nomGuichet, typeGuichet, id_agence } = args;

  if (!nomGuichet?.trim() || !id_agence) {
    throw new HttpError(400, "Le nom du guichet et l'agence parente sont requis.");
  }

  const user = context.user;
  const isAuthorized =
    user.role === 'DIRECTION' ||
    user.role === 'QUALITE' ||
    user.id_agence === id_agence;

  if (!isAuthorized) {
    throw new HttpError(403, 'Accès refusé.');
  }

  // Utilisation d'une transaction pour créer le guichet ET l'affectation par défaut
  return await context.entities.Guichet.create({
    data: {
      nom_guichet: nomGuichet.trim(),
      type_guichet: typeGuichet || 'Physique',
      actif: true,
      agence: { connect: { id: id_agence } },
      // On crée automatiquement l'affectation par défaut pour le Receveur lui-même
      affectations: {
        create: {
          date_affectation: new Date(), // Aujourd'hui
          heure_debut: "08:00",
          heure_fin: "17:00",
          id_agent: user.id // Le Receveur s'auto-affecte par défaut
        }
      }
    }
  });
};

export const assignAgent = async (args: any, context: any) => {
  if (!context.user || context.user.role !== 'CHEF_AGENCE') {
    throw new HttpError(403, 'Accès refusé.');
  }

  if (!args.date || !args.heure_debut || !args.heure_fin || !args.id_guichet || !args.id_agent) {
    throw new HttpError(400, 'Tous les champs de planification sont requis.');
  }

  return context.entities.AffectationGuichet.create({
    data: {
      date_affectation: new Date(args.date),
      heure_debut: args.heure_debut,
      heure_fin: args.heure_fin,
      id_guichet: args.id_guichet,
      id_agent: args.id_agent,
    }
  });
};

export const soumettreAvis = async (args: any, context: any) => {
  const { guichetId, score, critereId, canalId, commentaire } = args;

  if (!guichetId || score === undefined || score === null) {
    throw new HttpError(400, "Identifiant du guichet et score requis.");
  }

  const parsedScore = Number(score);
  if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 5) {
    throw new HttpError(400, "Le score doit être un entier compris entre 1 et 5.");
  }

  const guichet = await context.entities.Guichet.findUnique({
    where: { id: Number(guichetId) },
  });

  if (!guichet) {
    throw new HttpError(404, "Guichet introuvable.");
  }

  const now = new Date();
  const timeString = now.toTimeString().slice(0, 5);

  const affectation = await context.entities.AffectationGuichet.findFirst({
    where: {
      id_guichet: guichet.id,
      date_affectation: new Date().toISOString().split('T')[0],
      heure_debut: { lte: timeString },
      heure_fin: { gte: timeString }
    }
  });

  if (critereId) {
    const critere = await context.entities.Critere.findUnique({
      where: { id: Number(critereId) },
    });

    if (!critere) {
      throw new HttpError(404, "Critère introuvable.");
    }
  }

  if (canalId) {
    const canal = await context.entities.Canal.findUnique({
      where: { id: Number(canalId) },
    });

    if (!canal) {
      throw new HttpError(404, "Canal introuvable.");
    }
  }

  const reponse = await context.entities.Reponse.create({
    data: {
      score_brut: parsedScore,
      commentaire_texte: commentaire || "",
      id_critere: critereId ? Number(critereId) : null,
      id_canal: canalId ? Number(canalId) : null,
      id_agence: guichet.id_agence,
      id_guichet: guichet.id,
      id_service: 1,
      id_agent: affectation?.id_agent || null,
    }
  });

  if (parsedScore <= 2) {
    const destinataire = await context.entities.User.findFirst({
      where: {
        id_agence: guichet.id_agence,
        role: { in: ['CHEF_AGENCE', 'DIRECTION', 'QUALITE'] }
      }
    });

    if (destinataire) {
      await context.entities.Alerte.create({
        data: {
          message: `Note de ${parsedScore}/5 reçue au guichet "${guichet.nom_guichet}". Commentaire: "${commentaire || 'Aucun'}"`,
          type_alerte: "NOTE_CRITIQUE",
          statut_alerte: "NOUVELLE",
          id_reponse: reponse.id,
          id_destinataire: destinataire.id,
          id_guichet_concerne: guichet.id,
        }
      });
    }
  }

  return reponse;
};
export const createAgent = async (
  args: { nom: string; prenom: string; email: string; telephone: string; id_agence?: number },
  context: any
) => {
  const isAuthorized = context.user?.role === 'DIRECTION' || context.user?.role === 'CHEF_AGENCE';

  if (!isAuthorized) {
    throw new HttpError(403, 'Accès refusé.');
  }

  const targetAgenceId = args.id_agence ?? context.user.id_agence;

  if (context.user.role !== 'DIRECTION' && context.user.id_agence !== targetAgenceId) {
    throw new HttpError(403, 'Accès refusé.');
  }

  return context.entities.User.create({
    data: {
      ...args,
      role: 'AGENT',
      id_agence: targetAgenceId,
      password: 'passwordParDefaut123',
      actif: true,
    },
  });
};

export const updateAgent = async (
  args: { id: number; nom?: string; prenom?: string; email?: string; telephone?: string; id_agence?: number },
  context: any
) => {
  const isAuthorized = context.user?.role === 'DIRECTION' || context.user?.role === 'CHEF_AGENCE';

  if (!isAuthorized) {
    throw new HttpError(403, 'Accès refusé.');
  }

  const existing = await context.entities.User.findUnique({ where: { id: args.id } });
  if (!existing) {
    throw new HttpError(404, 'Agent introuvable.');
  }

  const targetAgenceId = args.id_agence ?? existing.id_agence ?? context.user.id_agence;
  if (context.user.role !== 'DIRECTION' && context.user.id_agence !== targetAgenceId) {
    throw new HttpError(403, 'Accès refusé.');
  }

  return context.entities.User.update({
    where: { id: args.id },
    data: {
      ...(args.nom ? { nom: args.nom } : {}),
      ...(args.prenom ? { prenom: args.prenom } : {}),
      ...(args.email ? { email: args.email } : {}),
      ...(args.telephone ? { telephone: args.telephone } : {}),
      ...(args.id_agence ? { id_agence: args.id_agence } : {}),
    },
  });
};

export const deleteAgent = async (args: { id: number }, context: any) => {
  if (!context.user) {
    throw new HttpError(403, 'Accès refusé.');
  }

  const existing = await context.entities.User.findUnique({ where: { id: args.id } });
  if (!existing) {
    throw new HttpError(404, 'Agent introuvable.');
  }

  if (context.user.role !== 'DIRECTION' && context.user.id_agence !== existing.id_agence) {
    throw new HttpError(403, 'Accès refusé.');
  }

  return context.entities.User.update({
    where: { id: args.id },
    data: { actif: false },
  });
};

export const createChefAgence = async (args: { nom: string; prenom: string; email: string; id_agence: number }, context: any) => {
  if (context.user?.role !== 'DIRECTION') {
    throw new HttpError(403, "Seule la direction peut nommer un chef d'agence.");
  }

  const chefExistant = await context.entities.User.findFirst({
    where: { id_agence: args.id_agence, role: 'CHEF_AGENCE', actif: true }
  });

  if (chefExistant) {
    throw new HttpError(400, "Cette agence possède déjà un Chef d'agence actif.");
  }

  return context.entities.User.create({
    data: {
      nom: args.nom,
      prenom: args.prenom,
      email: args.email,
      role: 'CHEF_AGENCE',
      id_agence: args.id_agence,
      password: 'passwordParDefaut123',
      actif: true,
    },
  });
};

export const promouvoirAgent = async (args: { id_agent: string }, context: any) => {
  if (context.user?.role !== 'DIRECTION') {
    throw new HttpError(403, 'Accès refusé.');
  }

  const existing = await context.entities.User.findUnique({ where: { id: args.id_agent } });
  if (!existing) {
    throw new HttpError(404, 'Agent introuvable.');
  }

  return context.entities.User.update({
    where: { id: args.id_agent },
    data: { role: 'CHEF_AGENCE' }
  });
};

export const inviteAgent = async (args: { email: string; nom: string; prenom: string; id_agence: number; role: string }, context: any) => {
  if (context.user?.role !== 'DIRECTION' && context.user?.role !== 'CHEF_AGENCE') {
    throw new HttpError(403, 'Accès refusé.');
  }

  const targetAgenceId = args.id_agence ?? context.user.id_agence;
  if (context.user.role !== 'DIRECTION' && context.user.id_agence !== targetAgenceId) {
    throw new HttpError(403, 'Accès refusé.');
  }

  const chefExistant = args.role === 'CHEF_AGENCE' ? await context.entities.User.findFirst({
    where: { id_agence: targetAgenceId, role: 'CHEF_AGENCE', actif: true }
  }) : null;

  if (chefExistant) {
    throw new HttpError(400, "Cette agence possède déjà un Chef d'agence actif.");
  }

  const tempPassword = crypto.randomBytes(16).toString('hex');

  const newUser = await context.entities.User.create({
    data: {
      email: args.email,
      nom: args.nom,
      prenom: args.prenom,
      role: args.role,
      id_agence: targetAgenceId,
      password: tempPassword,
      actif: true,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  await emailSender.send({
    to: args.email,
    subject: "Activation de votre compte CXSAT",
    html: `
      <h1>Bienvenue ${args.prenom} !</h1>
      <p>Votre compte ${args.role === 'CHEF_AGENCE' ? "de Chef d'Agence" : "d'Agent"} a été créé.</p>
      <p>Pour définir votre mot de passe, veuillez cliquer sur le lien ci-dessous :</p>
      <a href="${frontendUrl}/request-password-reset">Définir mon mot de passe</a>
      <p>Vous pourrez ensuite vous connecter avec votre adresse e-mail.</p>
    `,
    text: `Bienvenue ${args.prenom} ! Votre compte ${args.role === 'CHEF_AGENCE' ? "de Chef d'Agence" : "d'Agent"} a été créé. Pour définir votre mot de passe, visitez: ${frontendUrl}/request-password-reset`,
  });

  return newUser;
};

export const toggleCritereAgence = async (
  args: { id_critere: number; id_agence?: number; active: boolean },
  context: any
) => {
  if (!context.user) throw new HttpError(401, 'Non authentifié');

  const user = context.user;
  const isAuthorized = user.role === 'DIRECTION' || user.role === 'QUALITE' || user.role === 'CHEF_AGENCE';

  if (!isAuthorized) {
    throw new HttpError(403, 'Accès refusé. Vous devez être responsable ou directeur.');
  }

  const idAgence = args.id_agence ?? user.id_agence;
  if (!idAgence) {
    throw new HttpError(400, "Agence introuvable.");
  }

  if (args.active) {
    const existing = await context.entities.AgenceCritere.findFirst({
      where: { id_agence: idAgence, id_critere: args.id_critere },
    });
    if (!existing) {
      return context.entities.AgenceCritere.create({
        data: { id_agence: idAgence, id_critere: args.id_critere },
      });
    }
    return existing;
  } else {
    return context.entities.AgenceCritere.deleteMany({
      where: { id_agence: idAgence, id_critere: args.id_critere },
    });
  }
};

export const createCritere = async (
  args: { libelle_critere: string; description?: string; type_reponse?: string; options_reponse?: string; id_agence?: number },
  context: any
) => {
  if (!context.user) throw new HttpError(401, 'Non authentifié');

  if (!args.libelle_critere?.trim()) {
    throw new HttpError(400, "Le libellé est requis.");
  }

  const critere = await context.entities.Critere.create({
    data: {
      libelle_critere: args.libelle_critere.trim(),
      description: args.description?.trim() || null,
      type_reponse: args.type_reponse || "SMILEY",
      options_reponse: args.options_reponse?.trim() || null,
    },
  });

  const idAgence = args.id_agence ?? context.user.id_agence;
  if (idAgence) {
    await context.entities.AgenceCritere.create({
      data: { id_agence: idAgence, id_critere: critere.id },
    });
  }

  return critere;
};

// --- Tarification SaaS (montants en FCFA) : réservé aux admins CXSAT ---
export const updatePlanPricing = async (
  args: { planId: 'hobby' | 'pro' | 'credits10'; amountFcfa: number },
  context: any
) => {
  if (!context.user?.isAdmin) {
    throw new HttpError(403, 'Accès réservé aux administrateurs CXSAT.');
  }

  const { planId, amountFcfa } = args;

  if (!['hobby', 'pro', 'credits10'].includes(planId)) {
    throw new HttpError(400, 'Identifiant de plan invalide.');
  }

  if (!Number.isInteger(amountFcfa) || amountFcfa < 0) {
    throw new HttpError(400, 'Le montant doit être un entier positif en FCFA.');
  }

  return context.entities.PlanPricing.upsert({
    where: { id: planId },
    update: { amountFcfa },
    create: { id: planId, amountFcfa },
  });
};
