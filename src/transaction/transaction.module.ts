import { Module } from '@nestjs/common'
import { SignModule } from '../sign/sign.module'
import { SimpleAccountClientService } from './smart-wallets/simple-account/simple-account-client.service'
import { MultichainPublicClientService } from './multichain-public-client.service'
import { ViemMultichainClientService } from './viem_multichain_client.service'
//import { SimpleAccountClientService } from './smart-wallets/kernel/kernel-account-client.service'
import { SimpleAccountClientV2Service } from '@/transaction/smart-wallets/kernel/kernel-account-client-v2.service'

@Module({
  imports: [SignModule],
  providers: [
    SimpleAccountClientService,
    MultichainPublicClientService,
    ViemMultichainClientService,
    SimpleAccountClientService,
    SimpleAccountClientV2Service,
  ],
  exports: [
    SimpleAccountClientService,
    MultichainPublicClientService,
    SimpleAccountClientService,
    SimpleAccountClientV2Service,
  ],
})
export class TransactionModule {}
