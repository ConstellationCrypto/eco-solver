import { Chain } from 'viem'
import { b3Sepolia } from 'viem/chains'

export const b3Testnet: Chain = {
  ...b3Sepolia,
  rpcUrls: {
    default: {
      http: ['https://b3-testnet.rpc.caldera.xyz/25985cd3-b09d-44c7-8990-6351c476a789'],
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 27729186,
    },
  },
}
