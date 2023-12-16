import { transform as BuySellOfferTransform } from './buyselloffer-v1';

export const map = new Map<string, Function>();
map.set('buyselloffer-T0001', BuySellOfferTransform);
