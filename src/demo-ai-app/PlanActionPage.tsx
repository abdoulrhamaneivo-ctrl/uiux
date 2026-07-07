import React, { useState } from 'react';
import { useQuery, createTask, updateTask, getAlertes, getTasks } from 'wasp/client/operations';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, ShieldAlert, PlusCircle, CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { AmbientBackground } from '../client/components/AmbientBackground';
import { PageHeader } from '../client/components/PageHeader';
import { MotionCard } from '../client/components/MotionCard';
import { EmptyState } from '../client/components/EmptyState';
import { FormField } from '../client/components/FormField';
import { Button } from '../client/components/ui/button';
import { Input } from '../client/components/ui/input';

export const PlanActionPage = () => {
  const { data: alertes, isLoading: alertesLoading } = useQuery(getAlertes);
  const { data: tasks, isLoading: tasksLoading } = useQuery(getTasks);
  const [description, setDescription] = useState('');
  const [loadingCreation, setLoadingCreation] = useState(false);

  const activeAlertes = alertes?.filter((a: any) => a.statut_alerte !== 'TRAITEE') || [];
  const tasksList = tasks || [];

  const handleCreateAction = async (alerte: any) => {
    try {
      await createTask({
        description: `Action corrective suite à l'alerte : ${alerte.message}`,
        alerteId: alerte.id.toString(),
      });
      alert('Alerte prise en charge. Action ajoutée au plan !');
    } catch (err: any) {
      alert("Erreur de prise en charge : " + (err.message || 'Erreur inconnue'));
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoadingCreation(true);
    try {
      await createTask({ description });
      setDescription('');
    } catch (err: any) {
      alert("Erreur d'ajout : " + (err.message || 'Erreur inconnue'));
    } finally {
      setLoadingCreation(false);
    }
  };

  const isLoading = alertesLoading || tasksLoading;

  return (
    <AmbientBackground>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10">
        <PageHeader
          icon={ClipboardCheck}
          eyebrow="Amélioration continue"
          title="Plan d'Action Qualité"
          description="Pilotez et résolvez les dysfonctionnements relevés sur vos guichets."
        />

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-2xl bg-card-subtle/50" />
            <div className="h-64 animate-pulse rounded-2xl bg-card-subtle/50" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
            
            {/* SECTION 1 : ALERTES CRITIQUES EN ATTENTE (Alerte rouge réactive) */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="text-destructive size-5" /> Alertes urgentes en attente ({activeAlertes.length})
              </h2>
              
              {activeAlertes.length > 0 ? (
                <div className="space-y-3">
                  {activeAlertes.map((alerte: any, index: number) => (
                    <motion.div
                      key={alerte.id.toString()}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.05 }}
                    >
                      <MotionCard interactive={false} className="border-destructive/20 bg-destructive/5 p-4 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="text-destructive size-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{alerte.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">
                              {alerte.guichet?.nom_guichet || 'Guichet inconnu'} • {alerte.type_alerte}
                            </p>
                          </div>
                        </div>
                        <motion.div whileTap={{ scale: 0.97 }} className="pt-1">
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleCreateAction(alerte)}
                            className="w-full h-8 text-xs font-bold shadow-sm"
                          >
                            Prendre en charge (Action)
                          </Button>
                        </motion.div>
                      </MotionCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="Aucune alerte active"
                  description="Félicitations, tous les incidents signalés sur vos guichets ont été pris en charge."
                  className="py-10"
                />
              )}
            </section>

            {/* SECTION 2 : PLAN D'ACTION (La Todo List Qualité animée) */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="text-success size-5" /> Actions correctives en cours
              </h2>
              
              <MotionCard interactive={false} className="p-6 space-y-6">
                {/* Formulaire manuel */}
                <form onSubmit={handleAddManual} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrire une action corrective manuelle..."
                      className="h-10"
                    />
                  </div>
                  <Button type="submit" disabled={loadingCreation || !description.trim()} className="gap-2 h-10 shadow-sm">
                    <PlusCircle size={16} /> Ajouter
                  </Button>
                </form>

                {/* Liste des actions correctives */}
                {tasksList.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    <AnimatePresence>
                      {tasksList.map((task: any) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={task.isDone}
                              onChange={() => updateTask({ id: task.id, isDone: !task.isDone })}
                              className="w-5 h-5 rounded-full accent-primary mt-0.5 cursor-pointer"
                            />
                            <div>
                              <span className={`text-sm font-medium ${task.isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {task.description}
                              </span>
                              {task.alerte && (
                                <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wider">
                                  ⚠️ Lié à l'alerte #{task.alerte.id.toString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <EmptyState
                    icon={Inbox}
                    title="Aucune action dans le plan"
                    description="Ajoutez des tâches manuelles ou prenez en charge une alerte active pour alimenter le plan d'action."
                    className="py-10 border-0 bg-transparent"
                  />
                )}
              </MotionCard>
            </section>

          </div>
        )}
      </div>
    </AmbientBackground>
  );
};
