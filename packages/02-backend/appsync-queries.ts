export const gql = {
  Queries: {
    Hello: `query { hello }`,
  },
  Mutations: {
    SaveTransformedData: `mutation SaveTransformedData($id: ID!, $input: TransformedDataInput!) {
          saveTransformedData(id: $id, input: $input) {
            tradeEvent
            timestampUtc
            ledgerId
            eventDataJson
          }
        }`,
  },
};
