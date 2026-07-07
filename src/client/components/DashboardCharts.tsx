import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export const HistogrammeSatisfaction = ({ data }: { data: any[] }) => {
  const counts = [1, 2, 3, 4, 5].map((note) => ({
    name: `${note} étoile${note > 1 ? 's' : ''}`,
    count: data.filter(r => r.score_brut === note).length,
  }));

  return (
    <div className="h-72 rounded-2xl border border-border/70 bg-card p-5 shadow-premium">
      <h3 className="mb-4 text-sm font-bold text-foreground">Répartition des notes</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={counts}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis dataKey="name" className="fill-muted-foreground" />
          <YAxis className="fill-muted-foreground" />
          <Tooltip />
          <Bar dataKey="count">
            {counts.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? 'hsl(var(--destructive))' : index === counts.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RadarQualite = ({ data }: { data: any[] }) => {
  return (
    <div className="h-72 rounded-2xl border border-border/70 bg-card p-5 shadow-premium">
      <h3 className="mb-4 text-sm font-bold text-foreground">Index de Conformité (5 Axes)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" data={data}>
          <PolarGrid className="stroke-border" />
          <PolarAngleAxis dataKey="subject" className="fill-foreground text-xs font-semibold" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-[10px]" />
          <Radar
            name="Conformité"
            dataKey="A"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
