/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./index";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const saveTransformedData = /* GraphQL */ `mutation SaveTransformedData($id: ID!, $input: TransformedDataInput!) {
  saveTransformedData(id: $id, input: $input) {
    tradeEvent
    timestampUtc
    ledgerId
    eventDataJson
    __typename
  }
}
` as GeneratedMutation<
  APITypes.SaveTransformedDataMutationVariables,
  APITypes.SaveTransformedDataMutation
>;
