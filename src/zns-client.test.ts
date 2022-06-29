import { ZnsClient } from './zns-client';

describe('ZnsClient', () => {
  const subject = (providerOverrides = {}, metadataServiceOverrides = {}) => {
    const metadataService = {
      load: () => ({} as any),
      normalizeUrl: () => null,
      extractIpfsContentId: () => null,
      normalize: () => null,
      ...metadataServiceOverrides,
    };

    const provider = {
      getRecentSubdomainsById: () => [],
      getDomainsByName: () => [],
      ...providerOverrides,
    };

    return new ZnsClient(provider, metadataService);
  }

  it('calls getRecentSubdomainsById for id', async () => {
    const id = '0x01';
    const getRecentSubdomainsById = jest.fn(_ => []);
    const client = subject({ getRecentSubdomainsById });

    await client.getFeed(id);

    expect(getRecentSubdomainsById).toBeCalledWith(id)
  });

  it('verifies metadataUrl for domain', async () => {
    const getRecentSubdomainsById = async () => [
      {
        id: 'first-id',
        name: 'the.first.domain.name',
        metadataName: 'the-metadata-name-usually-matches-the-name-in-the-metadata',
        metadataUri: 'ipfs://QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345'
      },
    ];

    const metadataService = {
      normalizeUrl: () => 'http://subdomain.domain.com/QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345',
      extractIpfsContentId: () => 'QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345',
    };

    const client = subject({ getRecentSubdomainsById }, metadataService);

    const result = await client.getFeed('the-id');

    expect(result).toMatchObject([
      {
        'id': 'first-id',
        'ipfsContentId': 'QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345',
        'metadataUrl': 'http://subdomain.domain.com/QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345',
        'title': 'the-metadata-name-usually-matches-the-name-in-the-metadata',
        'znsRoute': 'the.first.domain.name',
      },
    ]);
  });

  it('imageUrl is falsy', async () => {
    const getRecentSubdomainsById = async () => [
      { id: 'first-id', name: 'the.first.domain.name', metadataUri: 'http://example.com/what-one' },
      { id: 'second-id', name: 'the.second.domain.name', metadataUri: 'http://example.com/what-two' },
    ];

    const loadMetadata = jest.fn((url) => {
      if (url === 'http://example.com/what-one') {
        return {
          title: 'first-title',
          description: 'first-description',
        };
      }

      return {
        title: 'second-title',
        description: 'second-description',
      };
    });

    const client = subject({ getRecentSubdomainsById }, { load: loadMetadata });

    const [item] = await client.getFeed('the-id');

    expect(item.imageUrl).toBeFalsy();
  });

  it('returns domains as feed items', async () => {
    const getRecentSubdomainsById = async () => [
      { id: 'first-id', name: 'the.first.domain.name' },
      { id: 'second-id', name: 'the.second.domain.name' },
      { id: 'third-id', name: 'the.third.domain.name' },
    ];

    const client = subject({ getRecentSubdomainsById });

    const feedItems = [{
      id: 'first-id',
      znsRoute: 'the.first.domain.name',
    }, {
      id: 'second-id',
      znsRoute: 'the.second.domain.name',
    }, {
      id: 'third-id',
      znsRoute: 'the.third.domain.name',
    }];

    expect(await client.getFeed('0x0')).toMatchObject(feedItems);
  });

  it('returns search as feed items', async () => {
    const getDomainsByName = async () => [
      { id: 'first-id', name: 'the.first.domain.name' },
      { id: 'second-id', name: 'the.second.domain.name' },
      { id: 'third-id', name: 'the.third.domain.name' },
    ];

    const client = subject({ getDomainsByName });

    const feedItems = [{
      id: 'first-id',
      znsRoute: 'the.first.domain.name',
    }, {
      id: 'second-id',
      znsRoute: 'the.second.domain.name',
    }, {
      id: 'third-id',
      znsRoute: 'the.third.domain.name',
    }];

    expect(await client.search('anything')).toMatchObject(feedItems);
  });
});
