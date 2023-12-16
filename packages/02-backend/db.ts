import { AttributeValue, DeleteItemCommand, DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { NodeHttpHandler } from '@smithy/node-http-handler';
const attr = require('dynamodb-data-types').AttributeValue;

export type TableRow = Record<string, AttributeValue>;

export abstract class Item {
  abstract get pk(): string;
  abstract get sk(): string;

  get keys(): TableRow {
    return {
      PK: { S: this.pk },
      SK: { S: this.sk },
    };
  }

  abstract toItem(): TableRow;
}

export abstract class ItemRepo {
  protected readonly tableName: string;
  protected readonly dynamoClient: DynamoDBClient;

  constructor() {
    if (!process.env.TABLE_NAME) throw new Error('TABLE_NAME is not found in env vars');
    if (!process.env.REGION) throw new Error('REGION is not found in env vars');
    this.tableName = process.env.TABLE_NAME;
    this.dynamoClient = new DynamoDBClient({
      region: process.env.REGION,
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 1000,
        socketTimeout: 1000,
      }),
    });
  }

  async putItem(item: Item) {
    return this.dynamoClient.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: item.toItem(),
      })
    );
  }

  async deleteItem(item: Item) {
    return this.dynamoClient.send(
      new DeleteItemCommand({
        TableName: this.tableName,
        Key: item.keys,
      })
    );
  }
}

export namespace Entity {
  export class RegisteredProviderDataSchema extends Item {
    static readonly Prefix = { Schema: 'SCHEMA#', Version: 'VERSION#' };
    constructor(
      private readonly schemaId: string,
      private readonly dateStamp: string,
      public readonly jsonSchema: string,
      public readonly transformationId: string
    ) {
      super();
    }

    get pk(): string {
      return `${RegisteredProviderDataSchema.Prefix.Schema}${this.schemaId}`;
    }

    get sk(): string {
      return `${RegisteredProviderDataSchema.Prefix.Version}${this.dateStamp}`;
    }

    toItem(): TableRow {
      return {
        ...this.keys,
        JsonSchema: { S: this.jsonSchema },
      };
    }

    static fromItem(item: TableRow): RegisteredProviderDataSchema {
      return new RegisteredProviderDataSchema(
        item.PK.S!.replace(Entity.RegisteredProviderDataSchema.Prefix.Schema, ''),
        item.SK.S!.replace(Entity.RegisteredProviderDataSchema.Prefix.Version, ''),
        item.JsonSchema.S!,
        item.TransformationId.S!
      );
    }
  }

  export class TransformedMarketsData extends Item {
    static readonly Prefix = { Category: 'CATEGORY#', CategoryType: 'CATEGORY_TYPE#', DataType: 'DATA_TYPE#', Timestamp: 'TIMESTAMP_UTC#' };
    constructor(
      private readonly categoryName: string,
      private readonly categoryType: string,
      private readonly dataType: string,
      private readonly dateStampUtc: string,
      private readonly ledgerId: string,
      public readonly data: object
    ) {
      super();
    }
    get pk(): string {
      return `${TransformedMarketsData.Prefix.Category}${this.categoryName}#${TransformedMarketsData.Prefix.CategoryType}${this.categoryType}#${TransformedMarketsData.Prefix.DataType}${this.dataType}`;
    }

    get sk(): string {
      return `${TransformedMarketsData.Prefix.Timestamp}${this.dateStampUtc}`;
    }

    toItem(): TableRow {
      return {
        ...this.keys,
        Data: { M: attr.wrap(this.data) },
        LedgerId: { S: this.ledgerId },
      };
    }

    static fromItem(item: TableRow): TransformedMarketsData {
      return new TransformedMarketsData(
        item.PK.S!.replace(TransformedMarketsData.Prefix.Category, '')
          .replace(TransformedMarketsData.Prefix.CategoryType, '')
          .replace(TransformedMarketsData.Prefix.DataType, ''),
        item.PK.S!.replace(TransformedMarketsData.Prefix.Category, '')
          .replace(TransformedMarketsData.Prefix.CategoryType, '')
          .replace(TransformedMarketsData.Prefix.DataType, ''),
        item.PK.S!.replace(TransformedMarketsData.Prefix.Category, '')
          .replace(TransformedMarketsData.Prefix.CategoryType, '')
          .replace(TransformedMarketsData.Prefix.DataType, ''),
        item.SK.S!.replace(TransformedMarketsData.Prefix.Timestamp, ''),
        item.LedgerId.S!,
        attr.unwrap(item.Data.M!)
      );
    }
  }
}

export namespace Repository {
  export class RegisteredProviderDataSchemaRepo extends ItemRepo {
    async getLatestSchema(schemaId: string): Promise<Entity.RegisteredProviderDataSchema | undefined> {
      const response = await this.dynamoClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'PK = :pk',
          ExpressionAttributeValues: {
            ':pk': { S: `${Entity.RegisteredProviderDataSchema.Prefix.Schema}${schemaId}` },
          },
          ScanIndexForward: false, //desc order gives latest version
          Limit: 1,
        })
      );

      if (response.Items && response.Items.length > 0) {
        return Entity.RegisteredProviderDataSchema.fromItem(response.Items[0]);
      }
    }
  }

  export class TransformedMarketsDataRepo extends ItemRepo {}
}
