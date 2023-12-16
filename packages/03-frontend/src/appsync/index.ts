/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type TransformedDataInput = {
  categoryName: string,
  categoryType: string,
  dataType: string,
  ledgerId: string,
  eventDataJson: string,
};

export type TransformedDataSubscription = {
  __typename: "TransformedDataSubscription",
  tradeEvent: string,
  timestampUtc: string,
  ledgerId: string,
  eventDataJson: string,
};

export type SaveTransformedDataMutationVariables = {
  id: string,
  input: TransformedDataInput,
};

export type SaveTransformedDataMutation = {
  saveTransformedData?:  {
    __typename: "TransformedDataSubscription",
    tradeEvent: string,
    timestampUtc: string,
    ledgerId: string,
    eventDataJson: string,
  } | null,
};

export type HelloQueryVariables = {
};

export type HelloQuery = {
  hello?: string | null,
};

export type OnTransformedDataSubscriptionVariables = {
  id?: string | null,
};

export type OnTransformedDataSubscription = {
  onTransformedData?:  {
    __typename: "TransformedDataSubscription",
    tradeEvent: string,
    timestampUtc: string,
    ledgerId: string,
    eventDataJson: string,
  } | null,
};
