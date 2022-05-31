import { SuperAgent, SuperAgentRequest } from 'superagent';

import { rootDomainId, ipfsBaseUrl } from './config';

export interface DomainMetadata {
  title: string;
  description: string;
  imageUrl: string;
}

export interface ZnsMetadataService {
  normalize?: (domain: object) => object;
}

export class MetadataService {
  constructor(private httpClient: SuperAgent, private config = { rootDomainId, ipfsBaseUrl }) { }


  async load(url: string): Promise<DomainMetadata> {
    const normalizedUrl = this.normalizeUrl(url);

    let body: any;

    try {
      const response = await this.httpClient.get(normalizedUrl);
      body = response.body;
    } catch (_e) {
    }

    if (!body) return null;

    return this.normalize(body);
  }

  extractIpfsContentId(url: string) {
    const result = url.match(/^ipfs:\/\/(?<contentId>.*)$/);
    if (result && result.groups) {
      return result?.groups['contentId'];
    }

    return null;
  }

  normalizeUrl(url: string) {
    const ipfsContentId = this.extractIpfsContentId(url);

    if (ipfsContentId) return `${this.ipfsBaseUrl}${ipfsContentId}`;

    return url;
  }

  normalize(domain: object) {
    return {
      title: domain.title || domain.name || null,
      description: domain.description || null,
      imageUrl: this.normalizeImage(domain) || null,
      animationUrl: this.normalizeAnimation(domain) || null,
      attributes: domain.attributes,
    }
  }

  private get ipfsBaseUrl() {
    let url = this.config.ipfsBaseUrl;

    if (!url.endsWith('/')) {
      url = `${url}/`;
    }

    return url;
  }

  private normalizeAnimation({ animation_url }) {
    const url = animation_url;

    if (!url) return null;

    return this.normalizeUrl(url);
  }

  private normalizeImage({ image, image_full }) {
    const url = image || image_full;

    if (!url) return null;

    return this.normalizeUrl(url);
  }
}
