/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./index";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onTransformedData = /* GraphQL */ `subscription OnTransformedData($id: ID) {
  onTransformedData(id: $id) {
    tradeEvent
    timestampUtc
    ledgerId
    eventDataJson
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnTransformedDataSubscriptionVariables,
  APITypes.OnTransformedDataSubscription
>;
