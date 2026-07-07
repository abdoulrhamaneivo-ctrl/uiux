import React from 'react';
import { useQuery, getReponses } from 'wasp/client/operations';
import { motion } from 'framer-motion';
import { MessageSquareQuote, Inbox } from 'lucide-react';
import { AmbientBackground } from '../components/AmbientBackground';
import { PageHeader } from '../components/PageHeader';
import { MotionCard } from '../components/MotionCard';
import { EmptyState } from '../components/EmptyState';

export const AvisPage = () => {
  const { data: reponses, isLoading } = useQuery(getReponses);
  const reponsesList: any[] = reponses || [];

  return (
    <AmbientBackground>
      <div className="mx-auto max-w-5xl p-6 lg:p-10">
        <PageHeader
          icon={MessageSquareQuote}
          eyebrow="Écoute client"
          title="Derniers retours clients"
          description="Consultez les commentaires laissés par vos clients, du plus récent au plus ancien."
          actions={
            reponsesList.length > 0 && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {reponsesList.length} retour{reponsesList.length > 1 ? 's' : ''}
              </span>
            )
          }
        />

        {isLoading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-border/70 bg-card-subtle/50"
              />
            ))}
          </div>
        )}

        {!isLoading && reponsesList.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="Aucun retour client pour l'instant"
            description="Les avis collectés via vos guichets (QR Code, USSD) s'afficheront ici."
          />
        )}

        <div className="grid gap-4">
          {reponsesList.map((rep: any, i: number) => (
            <motion.div
              key={rep.id.toString()}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <MotionCard interactive={false} className="flex items-start justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        rep.score_brut <= 2
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      Note : {rep.score_brut}/5
                    </span>
                    <span className="text-sm font-semibold text-secondary">
                      {rep.critere?.libelle_critere || 'Critère inconnu'}
                    </span>
                  </div>
                  <p className="mt-2 italic text-foreground">
                    "{rep.commentaire_texte || 'Pas de commentaire'}"
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">{rep.guichet?.nom_guichet || 'Guichet inconnu'}</p>
                  <p>{new Date(rep.date_reponse).toLocaleString()}</p>
                </div>
              </MotionCard>
            </motion.div>
          ))}
        </div>
      </div>
    </AmbientBackground>
  );
};
