import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

/**
 * Brand-aligned ambient page shell.
 * Soft, slowly-floating navy + amber halos on a subtly tinted background.
 * Keeps the exact brand palette (primary / secondary) — no off-brand hues.
 */
export const AmbientBackground = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn('bg-app-shell relative min-h-screen overflow-hidden', className)}
    >
      {/* Ambient halos */}
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-slower pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full bg-secondary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-secondary-muted/20 blur-3xl"
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
