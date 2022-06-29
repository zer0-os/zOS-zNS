import { utils } from 'ethers';
import { rootDomainId } from './config';

export class DomainResolver {
  constructor(private config = { rootDomainId }) { };

  idFromName(domainName: string) {
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

}
