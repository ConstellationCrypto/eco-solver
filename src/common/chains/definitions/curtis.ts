import { Chain } from 'viem'
import { curtis as vcurtis } from 'viem/chains'

export const curtis: Chain = {
  ...vcurtis,
  rpcUrls: {
    ...vcurtis.rpcUrls,
  },
}
