// JSON-LD structured data for SEO. Helps search engines and LLMs understand
// your app so it can appear in rich results and AI answers. Customize the
// placeholders below (URL, image) once your app is deployed.
import { AppName, AppTagline } from "../../shared/common";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://your-saas-app.com/#software",
      name: AppName,
      description: AppTagline,
      url: "https://your-saas-app.com",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Cross-platform",
      image: "https://your-saas-app.com/public-banner.webp",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://your-saas-app.com/#website",
      url: "https://your-saas-app.com",
      name: AppName,
      description: AppTagline,
    },
  ],
};

export function SchemaMarkup() {
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}
