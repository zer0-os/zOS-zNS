import * as superagent from 'superagent';
import { createInstance } from '@zero-tech/zns-sdk';

import { getForProvider } from './config';
import { MetadataService, ZnsMetadataService } from './metadata-service';
import { ZnsClient } from './zns-client';

export type { ZnsMetadataService };

export const metadataService = new MetadataService(superagent);

export interface ZnsClientFactory {
  get(web3Provider: any): Promise<ZnsClient>;
}

export const client: ZnsClientFactory = {
  async get(web3Provider: any) {
    const config = await getForProvider(web3Provider);

    return new ZnsClient(createInstance(config), metadataService);
  },
};
