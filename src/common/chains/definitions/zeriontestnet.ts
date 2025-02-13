import { Chain } from 'viem'

export const zerionTestnet: Chain = {
    
    id: 4457845,
    name: 'zerion testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
        http: ['https://zerion.calderachain.xyz/http'],
        },
    },
    blockExplorers: {
        default: {
        name: 'zerion Testnet Explorer',
        url: 'https://zero-explorer.vercel.app/',
        apiUrl: 'https://zero-explorer.vercel.app//api',
        },
    },
    // contracts: {
    //     multicall3: {
    //     address: '0xca54918f7B525C8df894668846506767412b53E3',
    //     blockCreated: 479584,
    //     },
    // },
    testnet: true,
}
