import { utils } from 'ethers';
import { ZnsMetadataService } from './metadata-service';
import { rootDomainId } from './config';

interface ZnsClientConfig {
  rootDomainId: string;
}

export class ZnsClient {
  constructor(private provider: any, private metadataService: ZnsMetadataService, private config: ZnsClientConfig = { rootDomainId }) { }

  async getFeed(id = this.config.rootDomainId) {
    const domains = await this.provider.getSubdomainsById(id);

    for (var domain of domains) {
      domain.metadataUrl = this.metadataService.normalizeUrl(domain.metadataUri);
      domain.ipfsContentId = this.metadataService.extractIpfsContentId(domain.metadataUri);
    }

    return domains.map(this.mapDomainToFeedItem);
  }

  async getFeedItem(id) {
    const domain = await this.provider.getDomainById(id);

    domain.metadataUrl = this.metadataService.normalizeUrl(domain.metadataUri);
    domain.ipfsContentId = this.metadataService.extractIpfsContentId(domain.metadataUri);

    return this.mapDomainToFeedItem(domain);
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
    const { id, name, metadata, metadataUrl, ipfsContentId, metadataName, owner, minter } = domain;
    const { title, description, imageUrl } = (metadata || { title: name });

    return {
      id,
      title: metadataName || title,
      description: description || title,
      znsRoute: name,
      imageUrl,
      metadataUrl,
      ipfsContentId,
      owner,
      minter
    };
  }
}
