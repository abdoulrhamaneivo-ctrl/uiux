// src/server/actions.ts
import { HttpError } from 'wasp/server';
import { emailSender } from 'wasp/server/email';
import crypto from 'node:crypto';
import { envoyerAlerteSMS, envoyerAlerteWhatsApp } from './notifications/gateway';

// Sel d'environnement pour le hachage des numéros de téléphone (ARTCI)
const TELEPHONE_SALT = process.env.TELEPHONE_HASH_SALT || 'cxsat-default-salt-change-me';

// ============================================================================
// ONBOARDING
// ============================================================================

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
  const user = await context.entities.User.findUnique({
    where: { id: context.user.id },
    include: { agence: true }
  });

  if (user?.id_agence !== null && user?.id_agence !== undefined) {
    throw new HttpError(400, 'Votre compte est déjà configuré avec une entreprise.');
  }

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

// ============================================================================
// GUICHETS
// ============================================================================

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

  return await context.entities.Guichet.create({
    data: {
      nom_guichet: nomGuichet.trim(),
      type_guichet: typeGuichet || 'Physique',
      actif: true,
      agence: { connect: { id: id_agence } },
      affectations: {
        create: {
          date_affectation: new Date(),
          heure_debut: "08:00",
          heure_fin: "17:00",
          id_agent: user.id
        }
      }
    }
  });
};

// ============================================================================
// PLANNING
// ============================================================================

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

// ============================================================================
// COLLECTE D'AVIS (avec anti-rejeu + notifications)
// ============================================================================

export const soumettreAvis = async (args: any, context: any) => {
  const { guichetId, score, critereId, canalId, commentaire, telephone } = args;

  if (!guichetId || score === undefined || score === null) {
    throw new HttpError(400, "Identifiant du guichet et score requis.");
  }

  const parsedScore = Number(score);
  if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 5) {
    throw new HttpError(400, "Le score doit être un entier compris entre 1 et 5.");
  }

  // --- ANTI-REJEU : hachage SHA-256 du numéro de téléphone ---
  if (telephone) {
    const hachage = crypto
      .createHash('sha256')
      .update(TELEPHONE_SALT + telephone.replace(/\s+/g, ''))
      .digest('hex');

    const hier = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existant = await context.entities.VoteAntiRejeu.findFirst({
      where: {
        hachage_tel: hachage,
        date_vote: { gte: hier },
      },
    });

    if (existant) {
      throw new HttpError(429, "Vous avez déjà soumis un avis depuis ce numéro ces dernières 24h.");
    }

    // Enregistrement du hachage
    await context.entities.VoteAntiRejeu.create({
      data: { hachage_tel: hachage },
    });

    // Nettoyage des hachages > 24h (purge légère)
    await context.entities.VoteAntiRejeu.deleteMany({
      where: { date_vote: { lt: hier } },
    });
  }
  // -----------------------------------------------------------

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
    if (!critere) throw new HttpError(404, "Critère introuvable.");
  }

  if (canalId) {
    const canal = await context.entities.Canal.findUnique({
      where: { id: Number(canalId) },
    });
    if (!canal) throw new HttpError(404, "Canal introuvable.");
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

  // --- ALERTE + NOTIFICATIONS si note critique ---
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

      // Envoi SMS/WhatsApp (mode stub si clés non configurées)
      if (destinataire.telephone) {
        const msgAlerte = `⚠️ CXSAT ALERTE — Note critique ${parsedScore}/5 au guichet "${guichet.nom_guichet}". Vérifiez vos tâches correctives.`;
        try {
          await envoyerAlerteWhatsApp(destinataire.telephone, msgAlerte);
        } catch {
          await envoyerAlerteSMS(destinataire.telephone, msgAlerte);
        }
      }
    }
  }

  return reponse;
};

// ============================================================================
// GESTION DU PERSONNEL
// ============================================================================

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
      ...(args.email !== undefined ? { email: args.email.trim() ? args.email.trim() : null } : {}),
      ...(args.telephone !== undefined ? { telephone: args.telephone.trim() ? args.telephone.trim() : null } : {}),
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

export const inviteAgent = async (
  args: { email?: string; nom: string; prenom: string; id_agence: number; role: string; telephone?: string },
  context: any
) => {
  if (context.user?.role !== 'DIRECTION' && context.user?.role !== 'CHEF_AGENCE') {
    throw new HttpError(403, 'Accès refusé.');
  }

  const targetAgenceId = args.id_agence ?? context.user.id_agence;
  if (context.user.role !== 'DIRECTION' && context.user.id_agence !== targetAgenceId) {
    throw new HttpError(403, 'Accès refusé.');
  }

  const normalizedEmail = args.email?.trim() ? args.email.trim() : null;

  // Un seul chef d'agence actif par agence
  if (args.role === 'CHEF_AGENCE') {
    if (!normalizedEmail) {
      throw new HttpError(400, "L'adresse e-mail est obligatoire pour un Chef d'Agence.");
    }
    const chefExistant = await context.entities.User.findFirst({
      where: { id_agence: targetAgenceId, role: 'CHEF_AGENCE', actif: true }
    });
    if (chefExistant) {
      throw new HttpError(400, "Cette agence possède déjà un Chef d'agence actif.");
    }
  }

  const tempPassword = crypto.randomBytes(16).toString('hex');

  const newUser = await context.entities.User.create({
    data: {
      email: normalizedEmail,
      nom: args.nom,
      prenom: args.prenom,
      role: args.role,
      id_agence: targetAgenceId,
      telephone: args.telephone || null,
      password: tempPassword,
      actif: true,
    },
  });


  // ✉️ Email envoyé UNIQUEMENT au Chef d'agence
  // Les agents simples (AGENT) n'ont pas besoin d'accès à l'application :
  // ils sont référencés dans le planning et les avis, mais ne se connectent pas.
  if (args.role === 'CHEF_AGENCE') {
    const frontendUrl = process.env.WASP_WEB_CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

    // Récupérer le nom de l'agence pour personnaliser l'email
    const agence = await context.entities.Agence.findUnique({
      where: { id: targetAgenceId },
      select: { nom_agence: true, commune: true },
    });

    const nomAgence = agence ? `${agence.nom_agence} — ${agence.commune}` : 'votre agence';

    await emailSender.send({
      to: normalizedEmail!,
      subject: `🎉 Bienvenue sur CXSAT — Accès Chef d'Agence`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,0.1);">

    <!-- En-tête -->
    <div style="background: linear-gradient(135deg, #0f2240 0%, #1a3a5c 60%, #c47a20 100%); padding: 36px 40px;">
      <div style="font-size: 40px; margin-bottom: 12px;">👋</div>
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 900; line-height: 1.2;">
        Bienvenue, ${args.prenom} !
      </h1>
      <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px;">
        Votre accès Chef d'Agence CXSAT est prêt
      </p>
    </div>

    <!-- Corps -->
    <div style="padding: 32px 40px;">
      <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.6;">
        La direction vient de vous nommer <strong>Chef d'Agence</strong> pour
        <strong>${nomAgence}</strong>. Votre rôle est de gérer les guichets, planifier
        les agents et suivre les alertes de satisfaction.
      </p>

      <!-- Bloc identifiants -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">
          Vos identifiants de connexion
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-radius: 8px;">
            <span style="color: #6b7280; font-size: 13px;">📧 Adresse e-mail</span>
            <strong style="color: #111827; font-size: 14px;">${args.email}</strong>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
            <span style="color: #92400e; font-size: 13px;">🔑 Agence</span>
            <strong style="color: #92400e; font-size: 14px;">${nomAgence}</strong>
          </div>
        </div>
      </div>

      <!-- Étapes -->
      <div style="margin: 24px 0;">
        <p style="margin: 0 0 14px; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">
          Pour commencer
        </p>
        ${[
          ['1', 'Définissez votre mot de passe', 'Cliquez sur le bouton ci-dessous pour sécuriser votre accès.'],
          ['2', 'Connectez-vous', `Rendez-vous sur ${frontendUrl}/login avec votre email.`],
          ['3', 'Gérez vos guichets', 'Planning, avis clients, alertes critiques — tout est centralisé.'],
        ].map(([num, titre, desc]) => `
        <div style="display: flex; gap: 14px; margin-bottom: 14px; align-items: flex-start;">
          <div style="
            flex-shrink: 0;
            width: 28px; height: 28px;
            background: linear-gradient(135deg, #1a3a5c, #c47a20);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-weight: 900; font-size: 13px; color: white;
          ">${num}</div>
          <div>
            <p style="margin: 0; font-weight: 700; color: #111827; font-size: 14px;">${titre}</p>
            <p style="margin: 2px 0 0; color: #6b7280; font-size: 13px;">${desc}</p>
          </div>
        </div>`).join('')}
      </div>

      <!-- CTA principal -->
      <div style="text-align: center; margin: 28px 0 8px;">
        <a href="${frontendUrl}/request-password-reset"
           style="
             display: inline-block;
             background: linear-gradient(135deg, #1a3a5c, #c47a20);
             color: white;
             text-decoration: none;
             padding: 14px 32px;
             border-radius: 10px;
             font-weight: 800;
             font-size: 15px;
             letter-spacing: -0.2px;
           ">
          Définir mon mot de passe →
        </a>
      </div>

      <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
        Ce lien vous permettra de définir votre mot de passe en toute sécurité.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        <strong>CXSAT</strong> — Plateforme de satisfaction client · Norme FD X50-167 ·
        <a href="${frontendUrl}" style="color: #c47a20; text-decoration: none;">cxsat.ci</a>
      </p>
      <p style="margin: 6px 0 0; color: #d1d5db; font-size: 11px;">
        Si vous n'attendiez pas cet email, ignorez-le ou contactez votre direction.
      </p>
    </div>
  </div>
</body>
</html>`,
      text: [
        `Bienvenue ${args.prenom} ${args.nom} !`,
        ``,
        `Vous avez été nommé(e) Chef d'Agence sur CXSAT pour : ${nomAgence}.`,
        ``,
        `Email de connexion : ${args.email}`,
        ``,
        `Étapes :`,
        `1. Définissez votre mot de passe : ${frontendUrl}/request-password-reset`,
        `2. Connectez-vous sur : ${frontendUrl}/login`,
        `3. Gérez vos guichets, planning et alertes depuis votre tableau de bord.`,
        ``,
        `CXSAT — Plateforme de satisfaction client`,
      ].join('\n'),
    });

    console.log(`[INVITE] Email Chef d'Agence envoyé à ${args.email} (${nomAgence})`);
  } else {
    // AGENT simple → créé silencieusement, pas d'email
    // Il sera assigné aux guichets via le planning sans jamais se connecter.
    console.log(`[INVITE] Agent créé silencieusement : ${args.prenom} ${args.nom} (pas d'email)`);
  }

  return newUser;
};


// ============================================================================
// CRITÈRES D'ÉVALUATION
// ============================================================================

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

// ============================================================================
// OBJECTIFS DE SATISFACTION (Module 1 — Planification)
// ============================================================================

export const upsertObjectif = async (
  args: { id_agence?: number; id_critere: number; valeur_cible: number; date_debut: string; date_fin: string },
  context: any
) => {
  if (!context.user) throw new HttpError(401, 'Non authentifié');

  const isAuthorized = context.user.role === 'DIRECTION' || context.user.role === 'QUALITE';
  if (!isAuthorized) throw new HttpError(403, 'Seuls la Direction et le service Qualité peuvent définir des objectifs.');

  const idAgence = args.id_agence ?? context.user.id_agence;
  if (!idAgence) throw new HttpError(400, "Agence requise.");

  if (args.valeur_cible < 0 || args.valeur_cible > 100) {
    throw new HttpError(400, "L'objectif doit être compris entre 0 et 100%.");
  }

  // Chercher un objectif actif existant pour ce couple agence/critère
  const existing = await context.entities.Objectif.findFirst({
    where: { id_agence: idAgence, id_critere: args.id_critere },
  });

  if (existing) {
    return context.entities.Objectif.update({
      where: { id: existing.id },
      data: {
        valeur_cible: args.valeur_cible,
        date_debut: new Date(args.date_debut),
        date_fin: new Date(args.date_fin),
      },
    });
  }

  return context.entities.Objectif.create({
    data: {
      id_agence: idAgence,
      id_critere: args.id_critere,
      valeur_cible: args.valeur_cible,
      date_debut: new Date(args.date_debut),
      date_fin: new Date(args.date_fin),
    },
  });
};

// ============================================================================
// TÂCHES CORRECTIVES (Module 5 — Amélioration / Kanban)
// ============================================================================

export const createTacheCorrective = async (
  args: { id_alerte: number; titre: string; description?: string; date_echeance: string; id_responsable: string },
  context: any
) => {
  if (!context.user) throw new HttpError(401, 'Non authentifié');

  const isAuthorized = ['DIRECTION', 'QUALITE', 'CHEF_AGENCE'].includes(context.user.role);
  if (!isAuthorized) throw new HttpError(403, 'Accès refusé.');

  if (!args.titre?.trim()) throw new HttpError(400, 'Le titre de la tâche est requis.');

  return context.entities.TacheCorrective.create({
    data: {
      titre: args.titre.trim(),
      description: args.description?.trim() || null,
      statut_tache: 'A_FAIRE',
      date_echeance: new Date(args.date_echeance),
      id_alerte: BigInt(args.id_alerte),
      id_responsable: args.id_responsable,
    },
  });
};

export const updateStatutTache = async (
  args: { id: number; statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' },
  context: any
) => {
  if (!context.user) throw new HttpError(401, 'Non authentifié');

  const STATUTS_VALIDES = ['A_FAIRE', 'EN_COURS', 'TERMINEE'];
  if (!STATUTS_VALIDES.includes(args.statut)) {
    throw new HttpError(400, 'Statut invalide.');
  }

  const tache = await context.entities.TacheCorrective.findUnique({ where: { id: BigInt(args.id) } });
  if (!tache) throw new HttpError(404, 'Tâche introuvable.');

  return context.entities.TacheCorrective.update({
    where: { id: BigInt(args.id) },
    data: {
      statut_tache: args.statut,
      ...(args.statut === 'TERMINEE' ? { date_cloture: new Date() } : {}),
    },
  });
};

export const marquerAlerteTraitee = async (args: { id_alerte: number }, context: any) => {
  if (!context.user) throw new HttpError(401, 'Non authentifié');

  return context.entities.Alerte.update({
    where: { id: BigInt(args.id_alerte) },
    data: {
      statut_alerte: 'TRAITEE',
      date_traitement: new Date(),
    },
  });
};

// ============================================================================
// TARIFICATION SaaS (montants en FCFA) — réservé aux admins CXSAT
// ============================================================================

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
