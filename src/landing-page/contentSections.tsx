import daBoiAvatar from "../client/static/da-boi.webp";
import type { GridFeature } from "./components/FeaturesGrid";

// TODO: remplacez les emojis par vos propres icônes (lucide-react) si besoin.
export const features: GridFeature[] = [
  {
    name: "Collecte multicanal inclusive",
    description:
      "QR/Web pour vos clients digitaux, USSD et vocal (IVR) en langue locale pour les autres. Personne n'est exclu.",
    emoji: "📲",
    size: "large",
  },
  {
    name: "Scoring Véracité & Conformité",
    description:
      "Un score clair par critère et par agence (Insuffisante, Informelle, Convaincante, Conforme), pas un rapport brut.",
    emoji: "📐",
    size: "medium",
  },
  {
    name: "Alertes en temps réel",
    description:
      "Une note critique déclenche une alerte SMS/WhatsApp immédiate au chef d'agence concerné.",
    emoji: "🚨",
    size: "medium",
  },
  {
    name: "Plan d'action qualité",
    description:
      "Chaque signal négatif devient une tâche corrective assignée, suivie jusqu'à sa clôture.",
    emoji: "✅",
    size: "small",
  },
  {
    name: "Planning des agents",
    description:
      "Affectez vos équipes aux guichets et retrouvez automatiquement qui était en poste au moment d'un avis.",
    emoji: "🗓️",
    size: "small",
  },
  {
    name: "Tableau de bord radar",
    description:
      "Visualisez en un coup d'œil les 5 axes du cycle qualité : planification, mesurage, surveillance, communication, amélioration.",
    emoji: "📊",
    size: "large",
  },
  {
    name: "Anonymat garanti",
    description:
      "Les numéros de téléphone sont hachés dès réception : aucune donnée personnelle n'est jamais stockée en clair.",
    emoji: "🔒",
    size: "small",
  },
  {
    name: "Anti-sabotage automatique",
    description:
      "Si un guichet planifié ne reçoit aucun avis depuis 2h, une alerte de silence prévient le responsable.",
    emoji: "🛡️",
    size: "small",
  },
  {
    name: "Multi-agences (SaaS)",
    description:
      "Chaque entreprise cliente est cloisonnée et pilote l'ensemble de son réseau d'agences depuis un seul espace.",
    emoji: "🏢",
    size: "medium",
  },
];

// TODO: remplacez ces témoignages par de vrais retours clients dès que possible.
export const testimonials = [
  {
    name: "Aïssata K.",
    role: "Direction Qualité",
    avatarSrc: daBoiAvatar,
    socialUrl: "",
    quote:
      "Nous détectons enfin les points de friction avant qu'ils ne se transforment en clients perdus.",
  },
  {
    name: "Kouamé J.",
    role: "Chef d'agence",
    avatarSrc: daBoiAvatar,
    socialUrl: "",
    quote:
      "L'alerte SMS m'a permis d'intervenir en moins de 15 minutes après une note critique au guichet.",
  },
  {
    name: "Awa D.",
    role: "Responsable Qualité",
    avatarSrc: daBoiAvatar,
    socialUrl: "",
    quote:
      "Le canal USSD nous permet enfin de recueillir l'avis des clients qui n'ont pas de smartphone.",
  },
];

export const faqs = [
  {
    id: 1,
    question: "Comment un client sans smartphone peut-il donner son avis ?",
    answer:
      "Via un code USSD court ou un appel vocal automatique, disponible en français simple et en langues locales (Dioula, Baoulé...). Aucune lecture ni connexion internet n'est nécessaire.",
    href: "#features",
  },
  {
    id: 2,
    question: "Les avis clients sont-ils anonymes ?",
    answer:
      "Oui. Le numéro de téléphone n'est jamais stocké en clair : il est haché dès réception, conformément aux exigences de l'ARTCI en Côte d'Ivoire.",
    href: "#features",
  },
  {
    id: 3,
    question: "Puis-je gérer plusieurs agences depuis un seul compte ?",
    answer:
      "Oui, la plateforme est multi-tenant : chaque entreprise cliente pilote l'ensemble de son réseau d'agences et de guichets depuis un seul espace, en toute confidentialité.",
    href: "#features",
  },
  {
    id: 4,
    question: "Puis-je essayer la plateforme gratuitement ?",
    answer:
      "Oui, vous pouvez créer votre espace et configurer vos premiers guichets avant de choisir une offre payante.",
    href: "/signup",
  },
];

export const footerNavigation = {
  app: [{ name: "Fonctionnalités", href: "#features" }],
  company: [
    { name: "Confidentialité", href: "#" },
    { name: "Conditions d'utilisation", href: "#" },
  ],
};
