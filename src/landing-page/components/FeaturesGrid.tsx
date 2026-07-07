import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "../../client/components/ui/card";
import { cn } from "../../client/utils";
import { Feature } from "./Features";
import { SectionTitle } from "./SectionTitle";

export interface GridFeature extends Omit<Feature, "icon" | "name" | "href"> {
  name?: string;
  icon?: React.ReactNode;
  emoji?: string;
  href?: string; // Rend 'href' optionnel
  direction?: "col" | "row" | "col-reverse" | "row-reverse";
  align?: "center" | "left";
  size: "small" | "medium" | "large";
  fullWidthIcon?: boolean;
  highlight?: boolean;
}

interface FeaturesGridProps {
  features: GridFeature[];
  className?: string;
}

export function FeaturesGrid({ features, className = "" }: FeaturesGridProps) {
  return (
    <div
      className="mx-auto my-16 flex max-w-7xl flex-col gap-4 md:my-24 lg:my-40"
      id="features"
    >
      <SectionTitle
        title="Fonctionnalités"
        description="Tout ce dont vous avez besoin pour piloter vos guichets au quotidien."
      />
      <div
        className={cn(
          "mx-4 grid auto-rows-[minmax(140px,auto)] grid-cols-2 gap-4 md:mx-6 md:grid-cols-4 lg:mx-8 lg:grid-cols-6",
          className,
        )}
      >
        {features.map((feature) => (
          <FeaturesGridItem
            key={feature.name + feature.description}
            {...feature}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturesGridItem({ name, description, emoji, size }: GridFeature) {
  const sizeClasses = {
    small: "col-span-2 md:col-span-1",
    medium: "col-span-2",
    large: "col-span-2 md:col-span-3 row-span-2",
  };

  return (
    <div className={cn("group relative", sizeClasses[size])}>
      <div className="h-full rounded-3xl border border-border/70 bg-card p-8 shadow-premium transition-all duration-300 group-hover:shadow-premium-lg group-hover:border-primary/30">
        <div className="mb-4 text-4xl">{emoji}</div>
        <h3 className="text-xl font-bold text-foreground">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
