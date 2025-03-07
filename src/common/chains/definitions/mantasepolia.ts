import { Chain } from 'viem'
import { mantaSepoliaTestnet as vmantaSepoliaTestnet } from 'viem/chains'

export const mantaSepoliaTestnet: Chain = {
  ...vmantaSepoliaTestnet,
  rpcUrls: {
    //...vmantaSepoliaTestnet.rpcUrls,
    default: {
      http: [
        'http://pacific-rpc.sepolia-testnet.manta.network/48305c86-958c-4f37-b9c1-463dc2f80308',
      ],
    },
  },
}
