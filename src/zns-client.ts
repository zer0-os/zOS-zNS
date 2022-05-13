import { utils } from 'ethers';
import { DomainMetadata } from './metadata-service';
import { rootDomainId } from './config';

interface ZnsClientConfig {
  rootDomainId: string;
}

interface ZnsMetadataService {
  load: (uri: string) => Promise<DomainMetadata>;
}

export class ZnsClient {
  constructor(private provider: any, private metadataService: ZnsMetadataService, private config: ZnsClientConfig = { rootDomainId }) { }

  async getFeed(id = this.config.rootDomainId) {
    const domains = await this.provider.getSubdomainsById(id);

    for (var domain of domains) {
      domain.metadata = await this.metadataService.load(domain.metadataUri);
    }

    return domains.map(this.mapDomainToFeedItem);
  }

  async search(pattern) {
    const domains = await this.provider.getDomainsByName(pattern);

    return domains.map(this.mapDomainToFeedItem);
  }

  resolveIdFromName(domainName: string) {
    const rootId = this.config.rootDomainId;

    if (!domainName) return rootId;

    return domainName
      .split('.')
      .reduce((prev, curr) => this.hashPair(prev, utils.id(curr)), rootId);
  }

  private hashPair(first: string, second: string) {
    return utils.keccak256(
      utils.defaultAbiCoder.encode(
        ['bytes32', 'bytes32'],
        [utils.arrayify(first), utils.arrayify(second)],
      ),
    );
  }

  private mapDomainToFeedItem(domain) {
    const { id, name, metadata } = domain;
    const { title, description, image } = (metadata || { title: name });

    return {
      id,
      title,
      description: description || title,
      znsRoute: name,
      imageUrl: image || null,
    };
  }
}
