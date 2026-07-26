import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { useBrand } from '../context/BrandContext';
import { BrandLogo } from './BrandLogo';

type FormatKey = 'A5' | 'A4' | 'BADGE';

export const KitGuichet = ({ guichet }: { guichet: any }) => {
  const kitRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { brandConfig } = useBrand();
  
  const evalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/q/${guichet.id}`
    : `https://cxsat.ci/q/${guichet.id}`;

  const ussdCode = `*789*42*${guichet.id}#`;

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loadingQr, setLoadingQr] = useState<boolean>(true);
  const [selectedFormat, setSelectedFormat] = useState<FormatKey>('A5');

  const formatConfigs = {
    A5: {
      widthPx: 420,
      heightPx: 594,
      containerStyle: { width: '420px', minHeight: '594px', padding: '32px', boxSizing: 'border-box' as const },
      qrWrapperStyle: { height: '280px', width: '280px' },
      qrSizeClass: "h-64 w-64",
      titleClass: "text-2xl mb-1",
      subtitleClass: "text-base mb-5",
      logoSize: 32,
      logoClass: "h-8 max-w-[120px]",
      scanTextClass: "text-xl mb-1",
      scanDescClass: "text-sm mb-4",
      ussdPaddingClass: "py-3 px-4 mt-4",
      label: "Format A5 (Affiche)",
    },
    A4: {
      widthPx: 595,
      heightPx: 842,
      containerStyle: { width: '595px', minHeight: '842px', padding: '48px', boxSizing: 'border-box' as const },
      qrWrapperStyle: { height: '410px', width: '410px' },
      qrSizeClass: "h-96 w-96",
      titleClass: "text-3xl font-black mb-2",
      subtitleClass: "text-lg mb-6",
      logoSize: 40,
      logoClass: "h-10 max-w-[160px]",
      scanTextClass: "text-2xl mb-2",
      scanDescClass: "text-base mb-6",
      ussdPaddingClass: "py-4 px-6 mt-6",
      label: "Format A4 (Poster)",
    },
    BADGE: {
      widthPx: 240,
      heightPx: 320,
      containerStyle: { width: '240px', minHeight: '320px', padding: '16px', boxSizing: 'border-box' as const },
      qrWrapperStyle: { height: '180px', width: '180px' },
      qrSizeClass: "h-40 w-40",
      titleClass: "text-lg mb-0.5",
      subtitleClass: "text-xs mb-3",
      logoSize: 24,
      logoClass: "h-6 max-w-[80px]",
      scanTextClass: "text-xs font-bold mb-0.5",
      scanDescClass: "text-[10px] leading-tight mb-2",
      ussdPaddingClass: "py-2 px-3 mt-2",
      label: "Badge / Sticker",
    },
  };

  const currentConfig = formatConfigs[selectedFormat];

  useEffect(() => {
    let active = true;
    setLoadingQr(true);
    const fetchQr = async () => {
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(evalUrl)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Response error');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (active) {
            setQrDataUrl(reader.result as string);
            setLoadingQr(false);
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Failed to pre-load QR code for export:', err);
        if (active) {
          setLoadingQr(false);
        }
      }
    };
    fetchQr();
    return () => {
      active = false;
    };
  }, [evalUrl]);

  const downloadKit = async () => {
    if (!kitRef.current) return;

    if (!qrDataUrl) {
      toast({
        variant: 'destructive',
        title: 'QR Code non disponible',
        description: "Le QR code n'a pas pu être généré. Vérifiez votre connexion puis réessayez.",
      });
      return;
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      // Ensure element scroll parent is reset during rasterization to prevent offset shifts on mobile
      const scrollParent = kitRef.current.parentElement;
      if (scrollParent) {
        scrollParent.scrollLeft = 0;
      }

      const dataUrl = await toPng(kitRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        width: currentConfig.widthPx,
        height: kitRef.current.offsetHeight || currentConfig.heightPx,
        style: {
          transform: 'none',
          margin: '0',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        },
      });
      const link = document.createElement('a');
      link.download = `affiche-${(brandConfig?.platform_name || "cxsat").toLowerCase()}-${selectedFormat.toLowerCase()}-${guichet.nom_guichet}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error("Erreur lors de la génération de l'affiche PNG:", err);
      toast({
        variant: 'destructive',
        title: "Échec de l'export de l'affiche",
        description: err?.message || 'Réessayez, ou utilisez "Copier le lien" en alternative.',
      });
    }
  };

  const primaryColorStyle = brandConfig ? { borderColor: `hsl(${brandConfig.color_primary})` } : {};

  return (
    <div className="space-y-6">
      {/* Sélecteur de format / dimension */}
      <div className="flex flex-wrap gap-2 justify-center print:hidden border-b border-border/60 pb-4">
        {(Object.keys(formatConfigs) as Array<FormatKey>).map((fmt) => (
          <button
            key={fmt}
            onClick={() => setSelectedFormat(fmt)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
              selectedFormat === fmt
                ? 'bg-primary text-primary-foreground border-primary shadow-premium-sm'
                : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
            }`}
          >
            {formatConfigs[fmt].label}
          </button>
        ))}
      </div>

      {/* Wrapper responsive avec défilement et centrage propre sur tous les écrans */}
      <div className="w-full overflow-x-auto momentum-scroll p-4 bg-neutral-50/50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-border/80 flex justify-center items-center">
        <div
          ref={kitRef}
          style={{ ...currentConfig.containerStyle, ...primaryColorStyle }}
          className="kit-affiche shrink-0 rounded-2xl border-4 bg-white text-center shadow-xl print:rounded-none print:border-black print:shadow-none overflow-hidden"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <BrandLogo className={currentConfig.logoClass} height={currentConfig.logoSize} />
            <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              {brandConfig?.platform_name || "CXSAT"}
            </span>
          </div>

          <h2 className={`${currentConfig.titleClass} font-extrabold leading-tight text-neutral-900 break-words`}>
            {brandConfig?.form_title || "Votre avis compte !"}
          </h2>
          <p className={`${currentConfig.subtitleClass} font-semibold text-neutral-600 break-words`}>
            {guichet.nom_guichet}
          </p>

          <div 
            style={currentConfig.qrWrapperStyle}
            className="mx-auto mb-5 flex items-center justify-center rounded-xl border-4 border-neutral-900 bg-white p-3 shrink-0"
          >
            {loadingQr ? (
              <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
                <Loader2 className="size-8 animate-spin" />
                <span className="text-xs font-semibold">Génération du QR...</span>
              </div>
            ) : (
              <img
                src={qrDataUrl}
                alt="QR Code d'évaluation"
                className="mx-auto block object-contain"
                style={{
                  width: selectedFormat === 'A4' ? '384px' : selectedFormat === 'A5' ? '256px' : '160px',
                  height: selectedFormat === 'A4' ? '384px' : selectedFormat === 'A5' ? '256px' : '160px',
                }}
              />
            )}
          </div>

          <p className={`${currentConfig.scanTextClass} font-extrabold uppercase tracking-wide text-neutral-900 break-words`}>
            {brandConfig?.qr_slogan || "Scannez ce QR Code"}
          </p>
          <p className={`${currentConfig.scanDescClass} font-medium text-neutral-600 break-words px-2`}>
            Notez-nous en 10 secondes, après votre passage à ce guichet
          </p>

          <div className={`rounded-xl bg-neutral-100 px-4 ${currentConfig.ussdPaddingClass} print:border print:border-neutral-400 print:bg-white overflow-hidden`}>
            <p className="text-xs font-semibold text-neutral-700 break-words">
              {brandConfig?.ussd_help_text || "Pas de connexion internet ?"}
            </p>
            <p className="text-sm font-bold tracking-wide text-neutral-900 mt-1 break-all">
              Composez <span className="font-extrabold text-primary">{ussdCode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-center print:hidden">
        <motion.div whileTap={{ scale: loadingQr ? 1 : 0.95 }}>
          <Button onClick={downloadKit} disabled={loadingQr} className="gap-2">
            {loadingQr ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <Download size={16} /> Télécharger ({selectedFormat})
              </>
            )}
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
