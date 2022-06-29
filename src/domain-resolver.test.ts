import { DomainResolver } from './domain-resolver';

describe('DomainResolver', () => {
  const subject = (config = {}) => {
    const allConfig = {
      rootDomainId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      ...config,
    };

    return new DomainResolver(allConfig);
  }

  it('resolves id for single root domain', () => {
    const client = subject();

    const expectedId = '0x5f594b54ed4a23525fcffd681a5a5cf0daf33105d9a2e9ab0ceeae4cc54dceea';

    expect(client.idFromName('tacos')).toStrictEqual(expectedId);
  });

  it('resolves root domain id if no id for empty string', () => {
    const client = subject({ rootDomainId: '0xb0b' });

    expect(client.idFromName('')).toStrictEqual('0xb0b');
  });

  it('resolves root domain id if no id for null', () => {
    const client = subject({ rootDomainId: '0xb0b' });

    expect(client.idFromName(null)).toStrictEqual('0xb0b');
  });

  it('resolves root domain id if no id for undefined', () => {
    const client = subject({ rootDomainId: '0xb0b' });

    expect(client.idFromName(undefined)).toStrictEqual('0xb0b');
  });

  it('resolves id for nested domain', () => {
    const client = subject();

    const expectedId = '0x28ce88e8ee1f700302155194a494101fd5d8163520cd08ba52a932a983391394';

    expect(client.idFromName('tacos.are.the.best.fruit')).toStrictEqual(expectedId);
  });
});
