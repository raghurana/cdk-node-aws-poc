export interface TradeData {
  data: Required<{ dataSupplierCode: string }>;
  metaData: {
    categoryId: string;
    categoryName: string;
    categoryType: string;
    dataType: string;
    dataVersion: string;
    schemaId: string;
  };
}

export interface S3ObjectInfo {
  bucketName: string;
  objectKey: string;
  fingerprint?: string;
}

export interface RegisteredSchemaInfo extends S3ObjectInfo {
  schemaId: string;
  transformationId: string;
}

export namespace Types {
  export type StepFnExecutionResult<T = void> = {
    Payload: {
      result: 'Succeeded' | 'Failed';
      failedMessage?: string;
      data?: T;
    };
  };

  export type StepFnPayload<T = void> = StepFnExecutionResult<T>['Payload'];
}

export namespace GqlTypes {
  export type TransformedDataInput<T> = {
    categoryName: string;
    categoryType: string;
    dataType: string;
    ledgerId: string;
    eventDataJson: T;
  };
  export type TransformedDataSubscription = {
    tradeEvent: string;
    timestampUtc: string;
    ledgerId: string;
    eventDataJson: object;
  };
}
