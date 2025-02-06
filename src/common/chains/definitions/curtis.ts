import { Chain } from 'viem'
import { curtis as vcurtis } from 'viem/chains'

export const curtis: Chain = {
  ...vcurtis,
  rpcUrls: {
    //...vcurtis.rpcUrls,
    default: {
      http: ['https://curtis.rpc.caldera.xyz/direct-http-01'],
    },
  },
  contracts: {
    ...vcurtis.contracts,
    multicall3: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        blockCreated: 7290821,
    },
  },
}
