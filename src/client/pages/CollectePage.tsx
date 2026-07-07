import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, getActiveCritereForGuichet, soumettreAvis } from 'wasp/client/operations';
import { MotionCard } from '../components/MotionCard';
import { Button } from '../components/ui/button';
import confetti from 'canvas-confetti';

export const CollectePage = () => {
  const { guichetId } = useParams<{ guichetId: string }>();
  const idGuichetNum = Number(guichetId);

  const { data: critere, isLoading } = useQuery(getActiveCritereForGuichet, { id_guichet: idGuichetNum });
  const [soumis, setSoumis] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [texteSaisi, setTexteSaisi] = useState('');

  const envoyerReponse = async (score: number, commentaire: string = "") => {
    if (envoiEnCours || soumis) return; // évite le double-clic / double-tap

    setEnvoiEnCours(true);
    setErreur(null);

    try {
      await soumettreAvis({
        guichetId: idGuichetNum,
        score: score,
        critereId: critere?.id || 1,
        canalId: 1,
        commentaire: commentaire
      });

      if (score >= 4 || score === 1) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setSoumis(true);
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'avis', err);
      setErreur("Votre avis n'a pas pu être envoyé. Merci de réessayer.");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const smileys = [
    { note: 1, icon: '😡', label: 'Très mécontent' },
    { note: 2, icon: '😟', label: 'Mécontent' },
    { note: 3, icon: '😐', label: 'Neutre' },
    { note: 4, icon: '🙂', label: 'Satisfait' },
    { note: 5, icon: '🤩', label: 'Très satisfait' },
  ];

  if (isLoading) return <div className="text-center p-10">Chargement...</div>;

  const currentCritere = critere || { libelle_critere: "Votre avis nous intéresse", type_reponse: "SMILEY" };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <AnimatePresence mode="wait">
        {!soumis ? (
          <MotionCard className="w-full max-w-sm p-8 text-center space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">{currentCritere.libelle_critere}</h1>
              {currentCritere.description && (
                <p className="text-xs text-muted-foreground mt-1">{currentCritere.description}</p>
              )}
            </div>

            {erreur && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {erreur}
              </div>
            )}

            {currentCritere.type_reponse === 'SMILEY' && (
              <div className="flex justify-between gap-2">
                {smileys.map((s) => (
                  <motion.button
                    key={s.note}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => envoyerReponse(s.note)}
                    disabled={envoiEnCours}
                    aria-label={s.label}
                    className="text-4xl p-2 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    {s.icon}
                  </motion.button>
                ))}
              </div>
            )}

            {currentCritere.type_reponse === 'OUI_NON' && (
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => envoyerReponse(1)}
                  disabled={envoiEnCours}
                  className="bg-success/10 hover:bg-success/20 text-success border border-success/30 font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-50"
                >
                  👍 Oui
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => envoyerReponse(0)}
                  disabled={envoiEnCours}
                  className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-50"
                >
                  👎 Non
                </motion.button>
              </div>
            )}

            {currentCritere.type_reponse === 'TEXTE' && (
              <div className="space-y-4">
                <textarea
                  value={texteSaisi}
                  onChange={(e) => setTexteSaisi(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  rows={4}
                  className="w-full px-3 py-2 border border-input bg-background rounded-xl text-sm focus:ring-1 focus:ring-ring text-foreground"
                />
                <Button onClick={() => envoyerReponse(5, texteSaisi)} disabled={!texteSaisi.trim() || envoiEnCours} className="w-full">
                  {envoiEnCours ? 'Envoi...' : 'Envoyer mon avis'}
                </Button>
              </div>
            )}

            {currentCritere.type_reponse === 'QCM' && (
              <div className="flex flex-col gap-2">
                {currentCritere.options_reponse?.split(',').map((option: string, index: number) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => envoyerReponse(5, option.trim())}
                    disabled={envoiEnCours}
                    className="w-full text-left p-3 border border-border rounded-xl hover:bg-primary/5 text-foreground text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    🔹 {option.trim()}
                  </motion.button>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">Votre retour est totalement anonyme</p>
          </MotionCard>
        ) : (
          <MotionCard className="w-full max-w-sm p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-foreground">Merci !</h2>
            <p className="text-muted-foreground">Votre retour a été bien pris en compte pour améliorer nos services.</p>
          </MotionCard>
        )}
      </AnimatePresence>
    </div>
  );
};
