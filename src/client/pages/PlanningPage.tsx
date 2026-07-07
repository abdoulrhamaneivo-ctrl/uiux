import React, { useState } from 'react';
import { useAuth } from 'wasp/client/auth';
import { useQuery, assignAgent, getGuichets, getAgents } from 'wasp/client/operations';
import { motion } from 'framer-motion';
import { MotionCard } from '../components/MotionCard';
import { Button } from '../components/ui/button';

export const PlanningPage = () => {
  const { data: user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState('');
  const [heureDebut, setHeureDebut] = useState('08:00');
  const [heureFin, setHeureFin] = useState('13:00');
  const userAgenceId = user?.id_agence;
  const { data: guichets } = useQuery(getGuichets, { id_agence: userAgenceId || 0 });
  const { data: agents } = useQuery(getAgents, { id_agence: userAgenceId || 0 });

  const handleAssign = async (guichetId: number) => {
    if (!selectedAgent) {
      alert('Veuillez sélectionner un agent.');
      return;
    }

    try {
      await assignAgent({
        id_guichet: guichetId,
        id_agent: Number(selectedAgent),
        date: new Date().toISOString().split('T')[0],
        heure_debut: heureDebut,
        heure_fin: heureFin,
      });
      alert('Agent affecté avec succès !');
    } catch (err) {
      alert("Erreur lors de l'affectation.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background px-4 py-12"
    >
      <MotionCard className="mx-auto max-w-7xl p-8">
        <h1 className="text-3xl font-bold text-foreground">Planning du jour</h1>
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <div className="grid gap-4 border-b border-border bg-muted/40 px-6 py-4 text-sm font-semibold text-foreground md:grid-cols-[250px_300px_120px]">
            <span>Guichet</span>
            <span>Affecter un Agent</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-border">
            {guichets?.map((g: any) => (
              <div key={g.id} className="grid gap-4 px-6 py-5 text-sm md:grid-cols-[250px_300px_120px]">
                <div>
                  <div className="font-semibold text-foreground">{g.nom_guichet}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{g.type_guichet || 'Guichet'}</div>
                </div>

                <div>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Sélectionner un agent...</option>
                    {agents?.map((agent: any) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.prenom} {agent.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="time"
                      value={heureDebut}
                      onChange={(e) => setHeureDebut(e.target.value)}
                      className="border border-input bg-background rounded px-2 py-1 text-sm text-foreground"
                      aria-label="Heure de début"
                    />
                    <input
                      type="time"
                      value={heureFin}
                      onChange={(e) => setHeureFin(e.target.value)}
                      className="border border-input bg-background rounded px-2 py-1 text-sm text-foreground"
                      aria-label="Heure de fin"
                    />
                  </div>
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button onClick={() => handleAssign(g.id)} className="w-full">
                      Valider
                    </Button>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionCard>
    </motion.div>
  );
};
