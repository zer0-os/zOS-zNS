import * as superagent from 'superagent';
import { createInstance } from '@zero-tech/zns-sdk';

import { getForProvider } from './config';
import { MetadataService } from './metadata-service';
import { ZnsClient } from './zns-client';

export const client = {
  async get(web3Provider: any) {
    const config = await getForProvider(web3Provider);

    return new ZnsClient(createInstance(config), new MetadataService(superagent));
  },
};
