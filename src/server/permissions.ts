import { HttpError } from 'wasp/server';

export const getAgencyFilter = (user: any) => {
  if (user.role === 'DIRECTION') return {};
  return { id_agence: user.id_agence };
};

export const assertAgencyAccess = (user: any, requestedAgenceId?: number) => {
  if (user.role === 'DIRECTION') return;
  if (!user.id_agence) throw new HttpError(403, 'Accès refusé: aucune agence liée.');
  if (requestedAgenceId && requestedAgenceId !== user.id_agence) {
    throw new HttpError(403, "Accès refusé à une autre agence.");
  }
};
