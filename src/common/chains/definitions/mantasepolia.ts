import { Chain } from 'viem'
import { mantaSepoliaTestnet as vmantaSepoliaTestnet } from 'viem/chains'

export const mantaSepoliaTestnet: Chain = {
  ...vmantaSepoliaTestnet,
  rpcUrls: {
    ...vmantaSepoliaTestnet.rpcUrls,
  },
}
