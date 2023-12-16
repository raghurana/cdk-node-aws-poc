import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { HttpRequest } from '@smithy/protocol-http';
import { SignatureV4 } from '@smithy/signature-v4';

export const AppSyncClient = {
  sendSignedIAMrequest: async (appsyncUrl: string, appsyncRegion: string, queryOrMutation: string, variables?: object) => {
    const url = new URL(appsyncUrl);
    const request = new HttpRequest({
      hostname: url.hostname,
      path: url.pathname,
      body: JSON.stringify({ query: queryOrMutation, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: url.hostname,
      },
    });
    const signer = new SignatureV4({
      credentials: defaultProvider(),
      service: 'appsync',
      region: appsyncRegion,
      sha256: Sha256,
    });

    // sign the request and extract the signed headers, body and method
    const { headers, body, method } = await signer.sign(request);
    console.log('body', body);
    return fetch(appsyncUrl, {
      headers,
      body,
      method,
    });
  },
};
