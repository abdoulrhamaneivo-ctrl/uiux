// src/server/middleware/rowLevelSecurity.ts
// ============================================================================
// Row-Level Security (RLS) — Isolation multi-tenant CXSAT
// ============================================================================
// Wasp expose le contexte utilisateur dans chaque action/query.
// Ce module fournit des helpers que chaque action/query doit appeler pour
// s'assurer que l'utilisateur ne peut accéder qu'aux données de son agence.
//
// Architecture :
//   - requireAuth(context)           → vérifie que l'user est connecté
//   - requireAgence(context)         → vérifie que l'user a une agence
//   - requireRole(context, roles)    → vérifie le rôle
//   - assertAgenceAccess(context, id)→ vérifie que l'id appartient à l'agence
//   - buildAgenceFilter(context)     → retourne le filtre Prisma { id_agence }
//
// Utilisation dans une query :
//   export const getGuichets = async (args, context) => {
//     requireAuth(context);
//     const filter = buildAgenceFilter(context);
//     return context.entities.Guichet.findMany({ where: filter });
//   };
// ============================================================================

import { HttpError } from 'wasp/server';

// ─────────────────────────────────────────────
// Types internes
// ─────────────────────────────────────────────

export interface WaspContext {
  user?: {
    id: string;
    role?: string | null;
    id_agence?: number | null;
    isAdmin?: boolean;
  } | null;
  entities: Record<string, any>;
}

export type CXSATRole =
  | 'DIRECTION'
  | 'QUALITE'
  | 'CHEF_AGENCE'
  | 'AGENT';

// ─────────────────────────────────────────────
// 1. Authentification
// ─────────────────────────────────────────────

/**
 * Vérifie que le contexte contient un utilisateur connecté.
 * Lève une HttpError 401 sinon.
 */
export function requireAuth(context: WaspContext): asserts context is WaspContext & { user: NonNullable<WaspContext['user']> } {
  if (!context.user) {
    throw new HttpError(401, 'Vous devez être connecté pour accéder à cette ressource.');
  }
}

// ─────────────────────────────────────────────
// 2. Rôles
// ─────────────────────────────────────────────

/**
 * Vérifie que l'utilisateur possède l'un des rôles autorisés.
 * Lève une HttpError 403 sinon.
 */
export function requireRole(context: WaspContext, roles: CXSATRole[]): void {
  requireAuth(context);
  const userRole = context.user!.role as CXSATRole | null | undefined;
  if (!userRole || !roles.includes(userRole)) {
    throw new HttpError(403, `Accès réservé aux profils : ${roles.join(', ')}.`);
  }
}

/**
 * Vérifie que l'utilisateur est administrateur de la plateforme.
 */
export function requireAdmin(context: WaspContext): void {
  requireAuth(context);
  if (!context.user!.isAdmin) {
    throw new HttpError(403, 'Accès réservé aux administrateurs CXSAT.');
  }
}

// ─────────────────────────────────────────────
// 3. Isolation par agence (RLS)
// ─────────────────────────────────────────────

/**
 * Vérifie que l'utilisateur est rattaché à une agence.
 * La DIRECTION peut accéder à toutes les agences → retourne null (pas de filtre).
 */
export function requireAgence(context: WaspContext): number | null {
  requireAuth(context);
  const { role, id_agence } = context.user!;

  // La DIRECTION voit tout (isolation par entreprise uniquement, pas par agence)
  if (role === 'DIRECTION') return null;

  if (!id_agence) {
    throw new HttpError(400, "Votre compte n'est pas rattaché à une agence. Finalisez l'onboarding.");
  }

  return id_agence;
}

/**
 * Construit le filtre Prisma `{ id_agence }` pour isoler les données.
 * - DIRECTION : retourne {} (pas de filtre → voit tout)
 * - Autres rôles : retourne { id_agence: <idAgenceUtilisateur> }
 */
export function buildAgenceFilter(context: WaspContext): { id_agence?: number } {
  requireAuth(context);
  const idAgence = requireAgence(context);

  if (idAgence === null) return {}; // DIRECTION → pas de filtre
  return { id_agence: idAgence };
}

/**
 * Vérifie qu'un enregistrement cible appartient bien à l'agence de l'utilisateur.
 * À utiliser avant toute modification d'un enregistrement récupéré en base.
 *
 * @param context  - Contexte Wasp
 * @param recordIdAgence - id_agence de l'enregistrement trouvé en base
 * @param resourceName - Nom de la ressource pour les messages d'erreur
 */
export function assertAgenceAccess(
  context: WaspContext,
  recordIdAgence: number,
  resourceName = 'ressource'
): void {
  requireAuth(context);
  const { role, id_agence } = context.user!;

  // La DIRECTION a accès à toutes les agences
  if (role === 'DIRECTION') return;

  if (id_agence !== recordIdAgence) {
    throw new HttpError(
      403,
      `Accès refusé : cette ${resourceName} appartient à une autre agence.`
    );
  }
}

/**
 * Vérifie que l'utilisateur peut gérer la cible `targetAgenceId`.
 * - DIRECTION : peut gérer toutes les agences
 * - Autres : uniquement leur propre agence
 */
export function assertCanManageAgence(
  context: WaspContext,
  targetAgenceId: number
): void {
  requireAuth(context);
  const { role, id_agence } = context.user!;

  if (role === 'DIRECTION') return;

  if (id_agence !== targetAgenceId) {
    throw new HttpError(403, "Vous ne pouvez gérer que les données de votre propre agence.");
  }
}

// ─────────────────────────────────────────────
// 4. Helpers composites fréquents
// ─────────────────────────────────────────────

/**
 * Vérifie auth + rôle de gestion (DIRECTION, QUALITE, CHEF_AGENCE).
 */
export function requireManagementRole(context: WaspContext): void {
  requireRole(context, ['DIRECTION', 'QUALITE', 'CHEF_AGENCE']);
}

/**
 * Retourne l'id d'agence effectif à utiliser pour une requête :
 * - Utilise `overrideIdAgence` si fourni ET si l'utilisateur est DIRECTION
 * - Sinon utilise l'agence de l'utilisateur
 */
export function resolveAgenceId(
  context: WaspContext,
  overrideIdAgence?: number
): number {
  requireAuth(context);
  const { role, id_agence } = context.user!;

  if (overrideIdAgence !== undefined) {
    if (role !== 'DIRECTION') {
      // Non-directeur : on ignore le override et on force l'agence de l'user
      if (!id_agence) throw new HttpError(400, "Agence introuvable.");
      return id_agence;
    }
    return overrideIdAgence;
  }

  if (!id_agence) throw new HttpError(400, "Agence introuvable. Finalisez l'onboarding.");
  return id_agence;
}
