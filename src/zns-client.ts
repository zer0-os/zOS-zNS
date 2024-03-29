import { ZnsMetadataService } from './metadata-service';
import { DomainResolver } from '.';

export class ZnsClient {
  constructor(private provider: any, private metadataService: ZnsMetadataService) { }

  async getFeed(id: string, limit: number = 150, offset: number = 0) {
    const domains = await this.provider.getMostRecentSubdomainsById(id, limit, offset, true); // the last param of true indicates to use the DataStore API, the SubGraph API does not support returning more than 1000 records

    return domains.map(this.mapDomainToFeedItem);
  }

  async getFeedItem(id: string) {
    const domain = await this.provider.getDomainById(id);

    return this.mapDomainToFeedItem(domain);
  }

  async search(pattern: string) {
    const domains = await this.provider.getDomainsByName(pattern);

    return domains.map(this.mapDomainToFeedItem);
  }

  resolveIdFromName(domainName: string) {
    console.warn('resolveIdFromName is deprecated and will be removed in a future version. Please use DomainResolver instead.');

    const resolver = new DomainResolver();

    return resolver.idFromName(domainName);
  }

  private mapDomainToFeedItem = (domain) => {
    const { id, name: znsRoute, metadataName: title, owner, minter, contract } = domain;

    const metadataUrl = this.metadataService.normalizeUrl(domain.metadataUri);
    const ipfsContentId = this.metadataService.extractIpfsContentId(domain.metadataUri);

    return {
      id,
      title,
      znsRoute,
      metadataUrl,
      ipfsContentId,
      owner,
      minter,
      contract
    };
  }
}
