import { SignupForm } from "wasp/client/auth";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { AuthPageLayout } from "./AuthPageLayout";
import { useRedirectIfLoggedIn } from "./hooks/useRedirectIfLoggedIn";

export function SignupPage() {
  useRedirectIfLoggedIn();

  return (
    <AuthPageLayout>
      <SignupForm
        additionalFields={[
          {
            name: "prenom",
            label: "Prénom",
            type: "input",
            validations: {
              required: "Le prénom est requis",
            },
          },
          {
            name: "nom",
            label: "Nom",
            type: "input",
            validations: {
              required: "Le nom est requis",
            },
          },
        ]}
      />
      <br />
      <span className="text-sm font-medium text-gray-900">
        J'ai déjà un compte (
        <WaspRouterLink to={routes.LoginRoute.to} className="underline">
          se connecter
        </WaspRouterLink>
        ).
      </span>
      <br />
    </AuthPageLayout>
  );
}
