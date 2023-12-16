import { Entity, Repository } from './db';
import { GqlTypes } from './interfaces';

export const GqlResolvers = {
  Query: {
    hello: (parent: any, args: any) => {
      return 'Hello world of resolvers!';
    },
  },
  Mutation: {
    saveTransformedData: async (parent: any, args: any): Promise<GqlTypes.TransformedDataSubscription> => {
      console.log('ARGS: ', args);
      const input = args.input as GqlTypes.TransformedDataInput<object>;
      const utcNow = new Date(Date.now()).toISOString();
      const output = await new Repository.TransformedMarketsDataRepo().putItem(
        new Entity.TransformedMarketsData(input.categoryName, input.categoryType, input.dataType, utcNow, input.ledgerId, input.eventDataJson)
      );
      console.log('DynamoDB putItem result: ', JSON.stringify(output));
      return {
        tradeEvent: `${input.categoryName}/${input.categoryType}/${input.dataType}`,
        timestampUtc: utcNow,
        ledgerId: input.ledgerId,
        eventDataJson: input.eventDataJson,
      };
    },
  },
};
