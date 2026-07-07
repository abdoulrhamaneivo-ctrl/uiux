import { action, app, page, query, route } from "@wasp.sh/spec";

import { App } from "./src/client/App" with { type: "ref" };
import { NotFoundPage } from "./src/client/components/NotFoundPage" with { type: "ref" };
import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };
import { LandingPage } from "./src/landing-page/LandingPage" with { type: "ref" };
import { seedMockUsers } from "./src/server/scripts/dbSeeds" with { type: "ref" };

// === IMPORTS POUR L'ONBOARDING ET GUICHETS CXSAT ===
import { OnboardingPage } from "./src/client/pages/OnboardingPage" with { type: "ref" };
import { GuichetsPage } from "./src/client/pages/GuichetsPage" with { type: "ref" };
import { PlanningPage } from "./src/client/pages/PlanningPage" with { type: "ref" };
import { CollectePage } from "./src/client/pages/CollectePage" with { type: "ref" };
import { DashboardPage } from "./src/client/pages/DashboardPage" with { type: "ref" };
import { AdminPersonnelPage } from "./src/client/pages/AdminPersonnelPage" with { type: "ref" };
import { AvisPage } from "./src/client/pages/AvisPage" with { type: "ref" };
import { ConfigurationCriteresPage } from "./src/client/pages/ConfigurationCriteresPage" with { type: "ref" };
import { AdminTarifsPage } from "./src/client/pages/AdminTarifsPage" with { type: "ref" };
import { completeOnboarding, createGuichet, assignAgent, soumettreAvis, createAgent, updateAgent, deleteAgent, createChefAgence, promouvoirAgent, inviteAgent } from "./src/server/actions" with { type: "ref" };
import { getGuichets, getAgents, getStatsFiltrees, getAgentsByAgence, getAgences, getReponses, getAlertes, getTasks, getCriteres, getAgenceCriteres, getActiveCritereForGuichet, getRadarStats, getPlanPricing } from "./src/server/queries" with { type: "ref" };
import { toggleCritereAgence, createCritere, updatePlanPricing } from "./src/server/actions" with { type: "ref" };

import { adminSpec } from "./src/admin/admin.wasp";
import { analyticsSpec } from "./src/analytics/analytics.wasp";
import { authConfig, authSpec } from "./src/auth/auth.wasp";
import { head } from "./src/client/head.wasp";
import { demoAiAppSpec } from "./src/demo-ai-app/demo-ai-app.wasp";
import { fileUploadSpec } from "./src/file-upload/file-upload.wasp";
import { paymentSpec } from "./src/payment/payment.wasp";
import { emailSender } from "./src/server/emailSender.wasp";
import { userSpec } from "./src/user/user.wasp";

const completeOnboardingAction = action(completeOnboarding, {
  entities: ["User", "Entreprise", "Agence"],
});

const createGuichetAction = action(createGuichet, {
  entities: ["Guichet", "User"],
});

const getGuichetsQuery = query(getGuichets, {
  entities: ["Guichet", "User"],
});

const getAgentsQuery = query(getAgents, {
  entities: ["User"],
});

const getReponsesQuery = query(getReponses, {
  entities: ["Reponse", "Critere", "Guichet"],
});

const onboardingRoute = route("OnboardingRoute", "/onboarding", page(OnboardingPage));
const guichetsRoute = route("GuichetsRoute", "/guichets", page(GuichetsPage));
const planningRoute = route("PlanningRoute", "/planning", page(PlanningPage));
const dashboardRoute = route("DashboardRoute", "/dashboard", page(DashboardPage));
const adminPersonnelRoute = route("AdminPersonnelRoute", "/admin/personnel", page(AdminPersonnelPage));
const avisRoute = route("AvisRoute", "/avis", page(AvisPage));
const configurationCriteresRoute = route("ConfigurationCriteresRoute", "/criteres", page(ConfigurationCriteresPage));
const adminTarifsRoute = route("AdminTarifsRoute", "/admin/tarifs", page(AdminTarifsPage));

const assignAgentAction = action(assignAgent, { entities: ["User", "AffectationGuichet"] });
const soumettreAvisAction = action(soumettreAvis, { entities: ["Reponse", "Critere", "Guichet", "AffectationGuichet"] });
const createAgentAction = action(createAgent, { entities: ["User"] });
const updateAgentAction = action(updateAgent, { entities: ["User"] });
const deleteAgentAction = action(deleteAgent, { entities: ["User"] });
const createChefAgenceAction = action(createChefAgence, { entities: ["User"] });
const promouvoirAgentAction = action(promouvoirAgent, { entities: ["User"] });
const inviteAgentAction = action(inviteAgent, { entities: ["User"] });
const toggleCritereAgenceAction = action(toggleCritereAgence, { entities: ["AgenceCritere", "User"] });
const createCritereAction = action(createCritere, { entities: ["Critere", "AgenceCritere", "User"] });
const updatePlanPricingAction = action(updatePlanPricing, { entities: ["PlanPricing", "User"] });
const getPlanPricingQuery = query(getPlanPricing, { entities: ["PlanPricing"] });
const collecteRoute = route("CollecteRoute", "/q/:guichetId", page(CollectePage));
const getStatsFiltereesQuery = query(getStatsFiltrees, { entities: ["Reponse"] });
const getAgentsByAgenceQuery = query(getAgentsByAgence, { entities: ["User"] });
const getAgencesQuery = query(getAgences, { entities: ["Agence"] });
const getAlertesQuery = query(getAlertes, { entities: ["Alerte", "Guichet", "Reponse"] });
const getTasksQuery = query(getTasks, { entities: ["Task", "User", "Alerte"] });
const getCriteresQuery = query(getCriteres, { entities: ["Critere"] });
const getAgenceCriteresQuery = query(getAgenceCriteres, { entities: ["AgenceCritere", "User"] });
const getActiveCritereForGuichetQuery = query(getActiveCritereForGuichet, { entities: ["Guichet", "AgenceCritere", "Critere"] });
const getRadarStatsQuery = query(getRadarStats, {
  entities: ["User", "Guichet", "AffectationGuichet", "Reponse", "Alerte", "Task"],
});

export default app({
  name: "CXSAT",
  wasp: {   version: "^0.24.0" },
  title: "CXSAT — Satisfaction Client",
  head,
  auth: authConfig,
  db: {
    seeds: [
      seedMockUsers,
    ],
  },
  client: {
    rootComponent: App,
  },
  server: {
    envValidationSchema: serverEnvValidationSchema,
  },
  emailSender,
  spec: [
    route("LandingPageRoute", "/", page(LandingPage), { prerender: true }),
    route("NotFoundRoute", "*", page(NotFoundPage)),
    authSpec,
    userSpec,
    demoAiAppSpec,
    paymentSpec,
    fileUploadSpec,
    analyticsSpec,
    adminSpec,
    onboardingRoute,
    guichetsRoute,
    planningRoute,
    dashboardRoute,
    adminPersonnelRoute,
    avisRoute,
    configurationCriteresRoute,
    adminTarifsRoute,
    collecteRoute,
    completeOnboardingAction,
    createGuichetAction,
    assignAgentAction,
    soumettreAvisAction,
    createAgentAction,
    updateAgentAction,
    deleteAgentAction,
    createChefAgenceAction,
    promouvoirAgentAction,
    inviteAgentAction,
    toggleCritereAgenceAction,
    createCritereAction,
    updatePlanPricingAction,
    getPlanPricingQuery,
    getStatsFiltereesQuery,
    getAgentsByAgenceQuery,
    getAgencesQuery,
    getGuichetsQuery,
    getAgentsQuery,
    getReponsesQuery,
    getAlertesQuery,
    getTasksQuery,
    getCriteresQuery,
    getAgenceCriteresQuery,
    getActiveCritereForGuichetQuery,
    getRadarStatsQuery,
  ],
});
