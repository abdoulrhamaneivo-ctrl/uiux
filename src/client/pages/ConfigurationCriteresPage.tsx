import React, { useState } from 'react';
import { useAuth } from 'wasp/client/auth';
import { useQuery, getCriteres, getAgenceCriteres, getAgences, toggleCritereAgence, createCritere } from 'wasp/client/operations';
import { motion } from 'framer-motion';
import { MotionCard } from '../components/MotionCard';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';

export const ConfigurationCriteresPage = () => {
  const { data: user } = useAuth();
  const [selectedAgenceId, setSelectedAgenceId] = useState<number>(user?.id_agence ?? 1);

  const { data: criteres, isLoading: loadingCriteres } = useQuery(getCriteres);
  const { data: agenceCriteresIds, isLoading: loadingActive } = useQuery(getAgenceCriteres, { id_agence: selectedAgenceId });
  const { data: agences } = useQuery(getAgences);

  const [nouveauLibelle, setNomLibelle] = useState('');
  const [nouvelleDesc, setNouvelleDesc] = useState('');
  const [typeReponse, setTypeReponse] = useState('SMILEY');
  const [optionsReponse, setOptionsReponse] = useState('');
  const [loadingCreation, setLoadingCreation] = useState(false);

  const activeIds: number[] = agenceCriteresIds || [];

  const handleToggle = async (idCritere: number, checked: boolean) => {
    try {
      await toggleCritereAgence({ id_critere: idCritere, id_agence: selectedAgenceId, active: checked });
    } catch (err: any) {
      alert("Erreur lors de la modification : " + (err.message || 'Erreur inconnue'));
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauLibelle.trim()) return;
    setLoadingCreation(true);
    try {
      await createCritere({ 
        libelle_critere: nouveauLibelle, 
        description: nouvelleDesc, 
        type_reponse: typeReponse,
        options_reponse: typeReponse === 'QCM' ? optionsReponse : undefined,
        id_agence: selectedAgenceId 
      });
      setNomLibelle('');
      setNouvelleDesc('');
      setOptionsReponse('');
      setTypeReponse('SMILEY');
    } catch (err: any) {
      alert("Erreur de création : " + (err.message || 'Erreur inconnue'));
    } finally {
      setLoadingCreation(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8"
    >
      <div className="border-b border-border pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Configuration des Critères</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Activez ou désactivez les axes de qualité d'évaluation (Norme FD X50-167) pour votre agence.
          </p>
        </div>

        {user?.role === 'DIRECTION' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Agence :</span>
            <select
              value={selectedAgenceId}
              onChange={(e) => setSelectedAgenceId(Number(e.target.value))}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-ring"
            >
              {agences?.map((ag: any) => (
                <option key={ag.id} value={ag.id}>{ag.nom_agence} ({ag.commune})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Axes d'évaluation nationaux et personnalisés</h2>

          {(loadingCriteres || loadingActive) && <p className="text-muted-foreground text-sm">Chargement des critères...</p>}

          <div className="grid gap-4">
            {criteres?.map((critere: any) => {
              const isActive = activeIds.includes(critere.id);
              return (
                <MotionCard key={critere.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-base">{critere.libelle_critere}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </div>
                    {critere.description && (
                      <p className="text-xs text-muted-foreground">{critere.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => handleToggle(critere.id, checked)}
                    />
                  </div>
                </MotionCard>
              );
            })}
          </div>
        </div>

        <MotionCard className="h-fit p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-foreground">Créer un critère à la carte</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Vous avez un standard spécifique ? Ajoutez une nouvelle question à votre questionnaire.
            </p>
          </div>

          <form onSubmit={handleCreateCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase mb-1">Votre question / Critère</label>
              <input
                type="text"
                required
                value={nouveauLibelle}
                onChange={(e) => setNomLibelle(e.target.value)}
                placeholder="Ex: Comment évaluez-vous la propreté ?"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase mb-1">Description (optionnel)</label>
              <input
                type="text"
                value={nouvelleDesc}
                onChange={(e) => setNouvelleDesc(e.target.value)}
                placeholder="S'affichera sous la question"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase mb-1">Type de réponse</label>
              <select
                value={typeReponse}
                onChange={(e) => setTypeReponse(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring"
              >
                <option value="SMILEY">⭐ Note / Smileys (1 à 5)</option>
                <option value="OUI_NON">👍 Oui / Non</option>
                <option value="QCM">📝 Choix Multiples (QCM)</option>
                <option value="TEXTE">✍️ Texte libre / Suggestion</option>
              </select>
            </div>

            {typeReponse === 'QCM' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-xs font-semibold text-foreground uppercase mb-1">Choix possibles (séparés par des virgules)</label>
                <input
                  type="text"
                  required
                  value={optionsReponse}
                  onChange={(e) => setOptionsReponse(e.target.value)}
                  placeholder="Ex: Trop d'attente, Personnel absent, Autre"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring"
                />
              </motion.div>
            )}

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button type="submit" disabled={loadingCreation} className="w-full">
                {loadingCreation ? "Création..." : "Ajouter la question"}
              </Button>
            </motion.div>
          </form>
        </MotionCard>
      </div>
    </motion.div>
  );
};
