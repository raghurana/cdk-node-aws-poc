import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { Dashboard } from "./markets/components/dashboard";
import { AppsyncConfig } from "./appsync/config";
import { useAuthenticator, Authenticator, Flex, Heading, Divider } from "@aws-amplify/ui-react";

Amplify.configure(AppsyncConfig);

export default function App() {
  const { route } = useAuthenticator((context) => [context.route]);
  return route === "authenticated" ? (
    <Dashboard />
  ) : (
    <Authenticator hideSignUp className="auth" components={authComponents} />
  );
}

const authComponents = {
  SignIn: {
    Header() {
      return (
        <Flex direction="column" margin={10}>
          <Heading textAlign={"center"}>Water data hub - Login</Heading>
          <Divider orientation="horizontal" />
        </Flex>
      );
    },
    Footer() {
      return <></>;
    },
  },
};
