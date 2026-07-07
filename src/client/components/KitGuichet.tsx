import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { CXSATLogo } from './CXSATLogo';

export const KitGuichet = ({ guichet }: { guichet: any }) => {
  const kitRef = useRef<HTMLDivElement>(null);
  const evalUrl = `https://cxsat.ci/q/${guichet.id}`;
  const ussdCode = `*789*42*${guichet.id}#`;

  const downloadKit = () => {
    if (kitRef.current) {
      toPng(kitRef.current, { pixelRatio: 3 }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `affiche-cxsat-${guichet.nom_guichet}.png`;
        link.href = dataUrl;
        link.click();
      });
    }
  };

  return (
    <div className="space-y-4">
      {/*
        Affiche A5 pensée pour être imprimée et collée devant le guichet :
        gros QR code, texte très lisible à distance, fort contraste.
      */}
      <div
        ref={kitRef}
        className="kit-affiche mx-auto w-full max-w-[420px] rounded-2xl border-4 border-foreground bg-white p-8 text-center shadow-xl print:w-[148mm] print:max-w-none print:rounded-none print:border-black print:shadow-none"
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <CXSATLogo className="size-8 text-foreground" />
          <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
            CXSAT
          </span>
        </div>

        <h2 className="mb-1 text-2xl font-extrabold leading-tight text-neutral-900">
          Votre avis compte !
        </h2>
        <p className="mb-5 text-base font-medium text-neutral-600">
          {guichet.nom_guichet}
        </p>

        <div className="mx-auto mb-5 inline-block rounded-xl border-4 border-neutral-900 bg-white p-3">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(evalUrl)}`}
            alt="QR Code d'évaluation"
            className="mx-auto block h-64 w-64 print:h-[70mm] print:w-[70mm]"
          />
        </div>

        <p className="mb-1 text-xl font-extrabold uppercase tracking-wide text-neutral-900">
          Scannez ce QR Code
        </p>
        <p className="mb-4 text-sm font-medium text-neutral-600">
          Notez-nous en 10 secondes, après votre passage à ce guichet
        </p>

        <div className="mt-4 rounded-xl bg-neutral-100 px-4 py-3 print:border print:border-neutral-400 print:bg-white">
          <p className="text-sm font-semibold text-neutral-700">
            Pas de connexion internet ?
          </p>
          <p className="text-lg font-bold tracking-wide text-neutral-900">
            Composez {ussdCode}
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-center print:hidden">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button onClick={downloadKit} className="gap-2">
            <Download size={16} /> Télécharger l'affiche (HD)
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(evalUrl)} className="gap-2">
            <Share2 size={16} /> Copier le lien
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
