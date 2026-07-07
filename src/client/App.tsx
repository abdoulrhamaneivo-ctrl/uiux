import { useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { routes } from "wasp/client/router";
import { Toaster } from "../client/components/ui/toaster";
import "./Main.css";
import { NavBar } from "./components/NavBar/NavBar";
import {
  demoNavigationitems,
  marketingNavigationItems,
} from "./components/NavBar/constants";
import { CookieConsentBanner } from "./components/cookie-consent/Banner";
import { AnimatePresence, motion } from "framer-motion";

export function App() {
  const location = useLocation();
  const isMarketingPage = useMemo(() => {
    return (
      location.pathname === routes.LandingPageRoute.to ||
      location.pathname === routes.PricingPageRoute.to
    );
  }, [location]);

  const navigationItems = isMarketingPage
    ? marketingNavigationItems
    : demoNavigationitems;

  const shouldDisplayAppNavBar = useMemo(() => {
    return (
      location.pathname !== routes.LoginRoute.build() &&
      location.pathname !== routes.SignupRoute.build()
    );
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith(routes.AdminRoute.to);
  }, [location]);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        // Scroll immediately, then keep watching for size changes
        // (e.g. async content loading) and re-scroll into view.
        element.scrollIntoView({ behavior: "smooth" });
        resizeObserverRef.current = new ResizeObserver(() => {
          element.scrollIntoView({ behavior: "smooth" });
        });
        resizeObserverRef.current.observe(element);
      }
    } else if (location.pathname === "/") {
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [location]);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-background text-foreground min-h-screen">
            {isAdminDashboard ? (
              <Outlet />
            ) : (
              <>
                {shouldDisplayAppNavBar && (
                  <NavBar navigationItems={navigationItems} />
                )}
                <div className="max-w-(--breakpoint-2xl) mx-auto">
                  <Outlet />
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <Toaster position="bottom-right" />
      <CookieConsentBanner />
    </>
  );
}
