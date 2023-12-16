import { ResourcesConfig } from "aws-amplify";

export const AppsyncConfig: ResourcesConfig = {
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_APPSYNC_URL,
      region: "ap-southeast-2",
      defaultAuthMode: "userPool",
    },
  },
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENTID,
    },
  },
};
