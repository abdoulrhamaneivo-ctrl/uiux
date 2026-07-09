// src/client/pages/GuichetsPage.tsx
import React, { useState, useRef } from 'react';
import { useQuery, createGuichet, getGuichets } from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { Printer, Store, PlusCircle, AlertCircle, Inbox, ArrowRight } from 'lucide-react';
import { AmbientBackground } from '../components/AmbientBackground';
import { PageHeader } from '../components/PageHeader';
import { MotionCard } from '../components/MotionCard';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { KitGuichet } from '../components/KitGuichet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RequireAuth } from '../components/RequireAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const TYPES_GUICHET = [
  { value: 'Caisse', label: 'Caisse de paiement' },
  { value: 'Accueil', label: "Guichet d'accueil / Secrétariat" },
  { value: 'Conseil', label: 'Box Conseiller clientèle' },
  { value: 'Borne', label: 'Borne automatique' },
];

export const GuichetsPage = () => {
  const { data: user } = useAuth();

  const [nomGuichet, setNomGuichet] = useState('');
  const [typeGuichet, setTypeGuichet] = useState('Caisse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userAgenceId = user?.id_agence;

  const {
    data: guichets,
    isLoading,
    error: queryError,
  } = useQuery(
    getGuichets,
    { id_agence: userAgenceId || 0 },
    { enabled: !!userAgenceId },
  );

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Kit-Evaluation-CXSAT',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAgenceId) return;
    setLoading(true);
    setError(null);

    try {
      await createGuichet({ nomGuichet, typeGuichet, id_agence: userAgenceId });
      setNomGuichet('');
    } catch (err: any) {
      setError(err.message || 'Erreur de création du guichet.');
    } finally {
      setLoading(false);
    }
  };

  if (!userAgenceId) {
    return (
      <RequireAuth>
      <AmbientBackground className="flex items-center justify-center p-8">
        <MotionCard interactive={false} className="max-w-md p-8 text-center">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/15">
            <AlertCircle className="size-6" />
          </span>
          <p className="mb-2 text-title-xsm font-bold text-foreground">
            Configuration requise
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            Veuillez d'abord finaliser la configuration de votre entreprise via la
            page d'onboarding.
          </p>
          <Button asChild className="w-full">
            <a href="/onboarding">
              Aller vers l'onboarding <ArrowRight className="size-4" />
            </a>
          </Button>
        </MotionCard>
      </AmbientBackground>
      </RequireAuth>
    );
  }

  const guichetCount = guichets?.length ?? 0;

  return (
    <RequireAuth>
    <AmbientBackground>
      <div className="mx-auto max-w-7xl p-6 lg:p-10">
        <PageHeader
          icon={Store}
          eyebrow="Points de contact"
          title="Gestion des Guichets Physiques"
          description="Ajoutez vos caisses et téléchargez vos kits d'évaluation (QR Codes & USSD)."
          actions={
            guichetCount > 0 && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button onClick={handlePrint}>
                  <Printer className="size-4" /> Imprimer le Kit complet
                </Button>
              </motion.div>
            )
          }
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Formulaire d'ajout rapide */}
          <MotionCard interactive={false} className="h-fit p-6 lg:sticky lg:top-8">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary ring-1 ring-inset ring-secondary/15">
                <PlusCircle className="size-5" />
              </span>
              <h2 className="text-title-xsm font-bold text-foreground">
                Créer une Caisse
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <FormField label="Nom du Guichet / Caisse" htmlFor="nom-guichet" required>
                <Input
                  id="nom-guichet"
                  required
                  value={nomGuichet}
                  onChange={(e) => setNomGuichet(e.target.value)}
                  placeholder="Ex: Caisse 1, Guichet Accueil..."
                  className="h-11"
                />
              </FormField>

              <FormField label="Type de guichet">
                <Select value={typeGuichet} onValueChange={setTypeGuichet}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_GUICHET.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Création...' : 'Ajouter le guichet'}
                </Button>
              </motion.div>
            </form>
          </MotionCard>

          {/* Liste des Guichets */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <h2 className="text-title-sm font-bold text-foreground">
                Vos Kits de Collecte
              </h2>
              {guichetCount > 0 && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {guichetCount} guichet{guichetCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isLoading && (
              <div className="space-y-4">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-40 animate-pulse rounded-2xl border border-border/70 bg-card-subtle/50"
                  />
                ))}
              </div>
            )}
            {queryError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                Erreur de chargement.
              </div>
            )}

            {!isLoading && guichetCount === 0 && (
              <EmptyState
                icon={Inbox}
                title="Aucun guichet créé pour le moment"
                description="Créez votre première caisse à gauche pour générer son kit de collecte (QR Code + USSD)."
              />
            )}

            <div className="grid grid-cols-1 gap-6">
              {guichets?.map((g: any, i: number) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <MotionCard interactive={false} className="p-6">
                    <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
                      <div>
                        <span className="mb-2 inline-block rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                          {g.type_guichet}
                        </span>
                        <h3 className="text-title-sm font-bold text-foreground">
                          {g.nom_guichet}
                        </h3>
                      </div>
                      <KitGuichet guichet={g} />
                    </div>
                  </MotionCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone d'impression masquée : une affiche A5 par page, prête à découper et à coller */}
        <div className="hidden">
          <div ref={componentRef}>
            {guichets?.map((g: any) => (
              <div
                key={g.id}
                className="flex min-h-screen items-center justify-center p-10"
                style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
              >
                <KitGuichet guichet={g} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AmbientBackground>
    </RequireAuth>
  );
};
