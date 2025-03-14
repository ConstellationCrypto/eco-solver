import { Chain } from 'viem'
import { b3Sepolia } from 'viem/chains'

export const b3Testnet: Chain = {
  ...b3Sepolia,
  rpcUrls: {
    default: {
      http: ['https://b3-testnet.rpc.caldera.xyz/http'],
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 27729186,
    },
  },
}
