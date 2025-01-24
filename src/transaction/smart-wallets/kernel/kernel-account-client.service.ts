import { Injectable, Logger } from '@nestjs/common'
import { ViemMultichainClientService } from '../../viem_multichain_client.service'
import { entryPoint07Address } from 'viem/account-abstraction'
import { EcoConfigService } from '../../../eco-configs/eco-config.service'
import { SignerService } from '../../../sign/signer.service'
import { Chain, Hex, zeroAddress } from 'viem'
import { SimpleAccountClientConfig } from './kernel-account.config'
import { KernelVersion } from 'permissionless/accounts'
import { createSimpleAccountClient, entryPointV_0_7 } from './create.kernel.account'
import { SimpleAccountClient } from './kernel-account.client'
import { EcoLogMessage } from '../../../common/logging/eco-log-message'

@Injectable()
export class SimpleAccountClientServiceBase<
  entryPointVersion extends '0.6' | '0.7',
  kernelVersion extends KernelVersion<entryPointVersion>,
> extends ViemMultichainClientService<
  SimpleAccountClient<entryPointVersion>,
  SimpleAccountClientConfig<entryPointVersion, kernelVersion>
> {
  private logger = new Logger(SimpleAccountClientServiceBase.name)

  constructor(
    readonly ecoConfigService: EcoConfigService,
    private readonly signerService: SignerService,
  ) {
    super(ecoConfigService)
  }

  protected override async createInstanceClient(
    configs: SimpleAccountClientConfig<entryPointVersion, kernelVersion>,
  ): Promise<SimpleAccountClient<entryPointVersion>> {
    const { client, args } = await createSimpleAccountClient(configs)
    if (args && args.deployReceipt) {
      this.logger.debug(
        EcoLogMessage.fromDefault({
          message: `Deploying Kernel Account`,
          properties: {
            ...args,
            simpleAccount: client.simpleAccount.address,
          },
        }),
      )
    }
    return client
  }

  protected override async buildChainConfig(
    chain: Chain,
  ): Promise<SimpleAccountClientConfig<entryPointVersion, kernelVersion>> {
    const base = await super.buildChainConfig(chain)
    return {
      ...base,
      account: this.signerService.getAccount(),
      entryPoint: {
        address: entryPoint07Address,
        version: '0.7' as entryPointVersion,
      },
      owners: [this.signerService.getAccount()],
      index: 0n, // optional
    }
  }
  /**
   * Returns the address of the wallet for the first solver in the config.
   * @returns
   */
  public override async getAddress(): Promise<Hex> {
    const solvers = this.ecoConfigService.getSolvers()
    if (!solvers || Object.values(solvers).length == 0) {
      return zeroAddress
    }

    const clientKernel = await this.getClient(Object.values(solvers)[0].chainID)
    return clientKernel.simpleAccount?.address
  }
}

@Injectable()
export class SimpleAccountClientService extends SimpleAccountClientServiceBase<
  entryPointV_0_7,
  KernelVersion<entryPointV_0_7>
> {
  constructor(ecoConfigService: EcoConfigService, signerService: SignerService) {
    super(ecoConfigService, signerService)
  }
}
