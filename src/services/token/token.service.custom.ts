import { Web3Provider } from '@ethersproject/providers';
import ITokenService from './token.service';
import ConfigServiceCustom from '../config/config.service.custom';
import AllowancesConcern from './concerns/allowances.concern';
import BalancesConcern from './concerns/balances.concern';
import MetadataConcern from './concerns/metadata.concern';

export default class TokenServiceCustom extends ITokenService {
  constructor(provider: Web3Provider, chainId: number) {
    const configService = new ConfigServiceCustom(chainId);

    const rpcProviderService = {
      jsonProvider: provider,
      config: configService,
      initBlockListener: () => {
        // no-op
      },
      getJsonProvider: () => provider,
    };

    super(
      MetadataConcern,
      BalancesConcern,
      AllowancesConcern,
      rpcProviderService as any,
      configService
    );
  }
}
