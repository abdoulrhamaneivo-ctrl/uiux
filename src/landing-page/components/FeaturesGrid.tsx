import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../client/utils";
import { Feature } from "./Features";
import { SectionTitle } from "./SectionTitle";

export interface GridFeature extends Omit<Feature, "icon" | "name" | "href"> {
  name?: string;
  icon?: React.ReactNode;
  emoji?: string;
  href?: string;
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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Correspondance emoji → couleur d'accent pour le cercle d'icône */
const EMOJI_COLORS: Record<string, string> = {
  "📲": "from-blue-500 to-sky-400",
  "📐": "from-violet-500 to-purple-400",
  "🚨": "from-red-500 to-orange-400",
  "✅": "from-emerald-500 to-green-400",
  "🗓️": "from-cyan-500 to-teal-400",
  "📊": "from-amber-500 to-yellow-400",
  "🔒": "from-slate-600 to-slate-500",
  "🛡️": "from-indigo-500 to-blue-400",
  "🏢": "from-orange-500 to-amber-400",
};

export function FeaturesGrid({ features, className = "" }: FeaturesGridProps) {
  return (
    <div
      className="mx-auto my-16 flex max-w-7xl flex-col gap-6 md:my-24 lg:my-40"
      id="features"
    >
      {/* Titre de section amélioré */}
      <div className="text-center px-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
          <span className="size-1.5 rounded-full bg-primary inline-block" />
          Fonctionnalités
        </span>
        <h2 className="text-3xl font-black text-foreground sm:text-4xl">
          Tout ce dont vous avez besoin
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-base">
          Pour piloter la satisfaction client de vos guichets au quotidien,
          du terrain à la direction.
        </p>
        {/* Ligne décorative */}
        <div className="mt-6 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className={cn(
          "mx-4 grid auto-rows-[minmax(160px,auto)] grid-cols-2 gap-4 md:mx-6 md:grid-cols-4 lg:mx-8 lg:grid-cols-6",
          className,
        )}
      >
        {features.map((feature) => (
          <FeaturesGridItem
            key={feature.name + feature.description}
            {...feature}
          />
        ))}
      </motion.div>
    </div>
  );
}

function FeaturesGridItem({ name, description, emoji, size }: GridFeature) {
  const sizeClasses = {
    small: "col-span-2 md:col-span-1",
    medium: "col-span-2",
    large: "col-span-2 md:col-span-3 row-span-2",
  };

  const accentGradient = (emoji && EMOJI_COLORS[emoji]) || "from-primary to-secondary";

  return (
    <motion.div
      variants={itemVariants}
      className={cn("group relative", sizeClasses[size])}
    >
      {/* Glow hover effect */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 scale-95" />

      <div
        className="
          h-full relative overflow-hidden rounded-3xl
          border border-border/60
          bg-white/80 dark:bg-slate-900/80
          backdrop-blur-sm
          p-7
          shadow-sm
          transition-all duration-400
          group-hover:shadow-premium-lg
          group-hover:border-primary/25
          group-hover:-translate-y-1
        "
      >
        {/* Shimmer de fond au hover */}
        <div
          className="
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
            bg-gradient-to-br from-white/60 via-transparent to-transparent dark:from-white/5
          "
        />

        {/* Cercle d'icône animé */}
        <div className="relative mb-5 inline-flex">
          <div
            className={`
              flex size-12 items-center justify-center rounded-2xl
              bg-gradient-to-br ${accentGradient}
              shadow-lg
              transition-transform duration-300
              group-hover:scale-110 group-hover:rotate-3
            `}
          >
            <span className="text-xl" role="img" aria-label={name}>{emoji}</span>
          </div>
          {/* Halo */}
          <div
            className={`
              absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40
              transition-opacity duration-300
              bg-gradient-to-br ${accentGradient} blur-md scale-110
            `}
          />
        </div>

        <h3 className="relative text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200">
          {name}
        </h3>
        <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Ligne d'accent en bas */}
        <div
          className={`
            absolute bottom-0 left-0 h-0.5 w-0
            group-hover:w-full
            transition-all duration-500
            bg-gradient-to-r ${accentGradient}
          `}
        />
      </div>
    </motion.div>
  );
}
