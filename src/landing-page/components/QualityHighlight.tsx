import { AlertTriangle, MessageSquareWarning, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../../client/components/ui/card";
import { HighlightedFeature } from "./HighlightedFeature";

export function QualityHighlight() {
  return (
    <HighlightedFeature
      name="De l'avis client à l'action, en temps réel"
      description="Chaque note critique déclenche automatiquement une alerte au chef d'agence, avec un temps de réaction cible inférieur à 15 minutes. Le score de Conformité (Insuffisante, Informelle, Convaincante, Conforme) rend visible en un coup d'œil ce qui doit être corrigé, agence par agence."
      highlightedComponent={<QualityMockPanel />}
      direction="row-reverse"
    />
  );
}

function QualityMockPanel() {
  return (
    <Card variant="outer" className="w-full max-w-lg overflow-hidden">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Conformité — Agence Adjamé
          </span>
          <span className="text-gradient-primary text-2xl font-black">
            72%
          </span>
        </div>

        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div className="from-accent to-secondary h-full w-[72%] rounded-full bg-linear-to-r" />
        </div>
        <p className="text-muted-foreground text-xs">
          Convaincante — objectif : atteindre « Conforme » (90%)
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <MockStat
            icon={<TrendingUp className="text-primary size-5" />}
            label="Satisfaction"
            value="+8%"
          />
          <MockStat
            icon={<AlertTriangle className="text-primary size-5" />}
            label="Alertes actives"
            value="2"
          />
          <MockStat
            icon={<MessageSquareWarning className="text-primary size-5" />}
            label="Délai moyen"
            value="12 min"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MockStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card-subtle flex flex-col items-center gap-1 rounded-lg p-3 text-center">
      {icon}
      <span className="text-lg font-bold">{value}</span>
      <span className="text-muted-foreground text-[0.65rem] leading-tight">
        {label}
      </span>
    </div>
  );
}
