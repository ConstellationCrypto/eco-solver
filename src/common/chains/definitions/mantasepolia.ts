import { Chain } from 'viem'
import { mantaSepoliaTestnet as vmantaSepoliaTestnet } from 'viem/chains'

export const mantaSepoliaTestnet: Chain = {
  ...vmantaSepoliaTestnet,
  rpcUrls: {
    //...vmantaSepoliaTestnet.rpcUrls,
    default: {
      http: ['https://manta-sepolia.rpc.caldera.xyz/http'],
    },
  },
  
}
