import { ZnsClient } from './zns-client';

describe('ZnsClient', () => {
  const subject = (providerOverrides = {}, metadataServiceOverrides = {}, config = {}) => {
    const allConfig = {
      rootDomainId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      ...config,
    };

    const metadataService = {
      load: () => ({} as any),
      normalizeUrl: () => null,
      extractIpfsContentId: () => null,
      ...metadataServiceOverrides,
    };

    const provider = {
      getRecentSubdomainsById: () => [],
      getDomainsByName: () => [],
      ...providerOverrides,
    };

    return new ZnsClient(provider, metadataService, allConfig);
  }

  it('resolves id for single root domain', () => {
    const client = subject();

    const expectedId = '0x5f594b54ed4a23525fcffd681a5a5cf0daf33105d9a2e9ab0ceeae4cc54dceea';

    expect(client.resolveIdFromName('tacos')).toStrictEqual(expectedId);
  });

  it('resolves root domain id if no id for empty string', () => {
    const client = subject({}, {}, { rootDomainId: '0xb0b' });

    expect(client.resolveIdFromName('')).toStrictEqual('0xb0b');
  });

  it('resolves root domain id if no id for null', () => {
    const client = subject({}, {}, { rootDomainId: '0xb0b' });

    expect(client.resolveIdFromName(null)).toStrictEqual('0xb0b');
  });

  it('resolves root domain id if no id for undefined', () => {
    const client = subject({}, {}, { rootDomainId: '0xb0b' });

    expect(client.resolveIdFromName(undefined)).toStrictEqual('0xb0b');
  });

  it('resolves id for nested domain', () => {
    const client = subject();

    const expectedId = '0x28ce88e8ee1f700302155194a494101fd5d8163520cd08ba52a932a983391394';

    expect(client.resolveIdFromName('tacos.are.the.best.fruit')).toStrictEqual(expectedId);
  });

  it('calls getRecentSubdomainsById for id', async () => {
    const id = '0x01';
    const getRecentSubdomainsById = jest.fn(_ => []);
    const client = subject({ getRecentSubdomainsById });

    await client.getFeed(id);

    expect(getRecentSubdomainsById).toBeCalledWith(id)
  });

  it('verifies metadataUrl for domain', async () => {
    const getRecentSubdomainsById = async () => [
      { id: 'first-id', name: 'the.first.domain.name', metadataUri: 'ipfs://QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345' },
    ];

    const metadataService = {
      normalizeUrl: () => 'http://subdomain.domain.com/QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345',
      extractIpfsContentId: () => 'QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345',
    };

    const client = subject({ getRecentSubdomainsById }, metadataService);

    const result = await client.getFeed('the-id');

    expect(result).toMatchObject([
      {
        'description': 'the.first.domain.name',
        'id': 'first-id',
        'imageUrl': undefined,
        'ipfsContentId': 'QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345',
        'metadataUrl': 'http://subdomain.domain.com/QmedrtBJfbn2xFTRqM8DEVJpCSwkaQgTHCFfHc6Q12345',
        'title': 'the.first.domain.name',
        'znsRoute': 'the.first.domain.name',
      },
      ]
    );
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

  it('calls getRecentSubdomainsById for root id if no id provided', async () => {
    const rootDomainId = '0x03';
    const getRecentSubdomainsById = jest.fn(_ => []);
    const client = subject({ getRecentSubdomainsById }, {}, { rootDomainId });

    await client.getFeed();

    expect(getRecentSubdomainsById).toBeCalledWith(rootDomainId)
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

    expect(await client.getFeed()).toMatchObject(feedItems);
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
