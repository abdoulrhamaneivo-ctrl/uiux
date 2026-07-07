import React, { useState } from 'react';
import { useAuth } from 'wasp/client/auth';
import {
  useQuery,
  createAgent,
  inviteAgent,
  updateAgent,
  deleteAgent,
  getAgentsByAgence,
  getAgences,
} from 'wasp/client/operations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Trash2,
  Mail,
  Phone,
  ShieldUser,
  Users,
  CheckCircle2,
  UsersRound,
} from 'lucide-react';
import { AmbientBackground } from '../components/AmbientBackground';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export const AdminPersonnelPage = () => {
  const { data: user } = useAuth();
  const [selectedAgenceId, setSelectedAgenceId] = useState<number>(
    user?.id_agence ?? 1,
  );
  const { data: agents } = useQuery(getAgentsByAgence, {
    id_agence: selectedAgenceId,
  });
  const { data: agences } = useQuery(getAgences);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'AGENT',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAgent({ id: editingId, ...formData, id_agence: selectedAgenceId });
      } else {
        await inviteAgent({
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          id_agence: selectedAgenceId,
          role: formData.role,
        });
      }
      setFormData({ nom: '', prenom: '', email: '', telephone: '', role: 'AGENT' });
      setEditingId(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la création ou de la mise à jour de l'agent", error);
    }
  };

  const handleEdit = (agent: any) => {
    setEditingId(agent.id);
    setFormData({
      nom: agent.nom,
      prenom: agent.prenom,
      email: agent.email || '',
      telephone: agent.telephone || '',
      role: agent.role || 'AGENT',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ nom: '', prenom: '', email: '', telephone: '', role: 'AGENT' });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAgent({ id });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'agent", error);
    }
  };

  const agentCount = agents?.length ?? 0;

  return (
    <AmbientBackground>
      <div className="min-h-screen p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            icon={Users}
            eyebrow="Équipe"
            title="Gestion du personnel"
            description="Ajoutez, modifiez et suivez les agents rattachés à votre agence."
            actions={
              user?.role === 'DIRECTION' && agences ? (
                <Select
                  value={String(selectedAgenceId)}
                  onValueChange={(v) => setSelectedAgenceId(Number(v))}
                >
                  <SelectTrigger className="h-10 min-w-56">
                    <SelectValue placeholder="Choisir l'agence" />
                  </SelectTrigger>
                  <SelectContent>
                    {agences.map((agence: any) => (
                      <SelectItem key={agence.id} value={String(agence.id)}>
                        {agence.nom_agence} ({agence.commune})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : undefined
            }
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* CARTE FORMULAIRE (Bento Style) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <UserPlus className="text-primary" /> {editingId ? 'Modifier un agent' : 'Nouvel Agent'}
              </h2>

              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm font-medium text-success"
                  >
                    <CheckCircle2 className="size-4" /> Opération réussie !
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="prenom"
                  placeholder="Prénom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
                <Input
                  name="nom"
                  placeholder="Nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email professionnel"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
                <Input
                  name="telephone"
                  placeholder="Téléphone (optionnel)"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="h-11"
                />

                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENT">Agent de guichet</SelectItem>
                    <SelectItem value="CHEF_AGENCE">Chef d'Agence</SelectItem>
                    <SelectItem value="QUALITE">Auditeur Qualité</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-3 pt-2">
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                      Annuler
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 rounded-xl bg-slate-900 font-bold hover:bg-slate-800">
                    {editingId ? 'Enregistrer' : 'Envoyer invitation'}
                  </Button>
                </div>
              </form>
            </motion.div>

            {/* GRILLE DES AGENTS (Bento Grid) */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {agents?.map((agent: any) => (
                  <motion.div
                    key={agent.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 font-bold text-xl">
                          {agent.prenom?.[0]}{agent.nom?.[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {agent.prenom} {agent.nom}
                          </h3>
                          <p className="text-xs text-slate-500">{agent.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(agent)}
                          aria-label="Modifier"
                          className="text-warning hover:bg-warning/10 hover:text-warning"
                        >
                          <ShieldUser className="size-4" />
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDelete(agent.id)}
                          aria-label="Supprimer"
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail size={14} /> {agent.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} /> {agent.telephone || 'Non renseigné'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {agentCount === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-2"
                >
                  <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/50">
                    <UsersRound className="mb-3 size-10 text-slate-400" />
                    <p className="font-semibold text-slate-900 dark:text-white">Aucun agent enregistré</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Ajoutez votre premier agent via le formulaire pour commencer à suivre votre équipe.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AmbientBackground>
  );
};
