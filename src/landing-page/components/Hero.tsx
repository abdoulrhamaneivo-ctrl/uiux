import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../../client/components/ui/button";
import { CXSATHeroBanner } from "./CXSATHeroBanner";

export function Hero() {
  return (
    <div className="relative w-full pt-14 overflow-hidden">
      <TopGradient />
      <BottomGradient />
      <div className="md:p-24 pb-0 md:pb-0">
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 shadow-sm dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
              </span>
              Collecte de satisfaction en temps réel
            </span>
          </div>

          <div className="lg:mb-18 mx-auto max-w-3xl text-center">
            <h1 className="text-foreground text-5xl font-black sm:text-6xl leading-tight">
              Pilotez la{" "}
              <span className="italic font-black">satisfaction client</span>{" "}
              de vos{" "}
              <span className="text-gradient-primary">guichets</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8">
              CXSAT collecte les avis QR, USSD et vocal, génère des alertes critiques
              en temps réel et transforme chaque signal négatif en plan d'action qualité.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button size="lg" variant="default" asChild className="w-full sm:w-auto px-8 font-bold shadow-lg hover:scale-[1.02] transition-transform">
                <WaspRouterLink to={routes.SignupRoute.to}>
                  Démarrer gratuitement <span aria-hidden="true" className="ml-1">→</span>
                </WaspRouterLink>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto px-8 hover:scale-[1.02] transition-transform">
                <WaspRouterLink to={routes.PricingPageRoute.to}>
                  Voir les tarifs
                </WaspRouterLink>
              </Button>
            </div>

            {/* Proof points */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <svg className="size-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                Anonymat ARTCI garanti
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="size-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                Alerte SMS en &lt;2 min
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="size-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                Multi-agences SaaS
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="size-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                Norme FD X50-167
              </span>
            </div>
          </div>

          {/* Dashboard preview banner */}
          <div className="mt-16 flow-root sm:mt-20">
            <div className="m-2 flex justify-center rounded-2xl lg:-m-4 lg:rounded-3xl lg:p-4">
              <CXSATHeroBanner />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className="absolute right-0 top-0 -z-10 w-full transform-gpu overflow-hidden blur-3xl sm:top-0"
      aria-hidden="true"
    >
      <div
        className="aspect-1020/880 w-280 bg-linear-to-tr flex-none from-amber-400 to-orange-300 opacity-15 sm:right-1/4 sm:translate-x-1/2 dark:opacity-5"
        style={{
          clipPath:
            "polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)",
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className="absolute inset-x-0 top-[calc(100%-40rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-65rem)]"
      aria-hidden="true"
    >
      <div
        className="aspect-1020/880 w-360 bg-linear-to-br relative from-amber-300 to-blue-900 opacity-10 sm:-left-3/4 sm:translate-x-1/4 dark:opacity-5"
        style={{
          clipPath: "ellipse(80% 30% at 80% 50%)",
        }}
      />
    </div>
  );
}
