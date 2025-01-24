export default {
  logger: {
    usePino: false,
  },
  database: {
    auth: {
      enabled: false,
      username: '',
      password: '',
      type: '',
    },

    uriPrefix: 'mongodb://',
    uri: 'localhost:27017',
    dbName: 'eco-solver-local',
    enableJournaling: true,
  },
  redis: {
    connection: {
      host: 'localhost',
      port: 6379,
    },
    jobs: {
      //remove on complete/fail for dev so we can submit the same tx multiple times
      intentJobConfig: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
  },
  intentSources: [
    {
      network: 'Curtis',
      chainID: 33111,
      tokens: [
        '0x804AAA73AA2732B2f84bB5E768Dc50003F0b3f78', //usdc
        '0x8Cb9a6A8692D3379F237CDE946B69888462D3c77', //usdt
      ],
      provers: ['0x436E7056A47AD2F1e2C788a26e6b8350AA4B7302'],
    },
    {
      network: 'manta-sepolia',
      chainID: 3441006,
      tokens: [
        '0x6E4D0AEC0fd8081E1Fd1f17B9769600efC72B51c', //usdc
        '0x1a8Eff33abcB8E7754daeA05582F4f7c93a9c75F', //usdt
      ],
      provers: ['0xac3f4357d650109a94c4a977f6c327b140cbac37'],
    },
  ],
  solvers: {
    33111: {
      targets: {
        '0x804AAA73AA2732B2f84bB5E768Dc50003F0b3f78': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
        },
        '0x8Cb9a6A8692D3379F237CDE946B69888462D3c77': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
        },
      },
      network: 'Curtis',
      chainID: 33111,
    },
    3441006: {
      targets: {
        '0x6E4D0AEC0fd8081E1Fd1f17B9769600efC72B51c': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
        },
        '0x1a8Eff33abcB8E7754daeA05582F4f7c93a9c75F': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
        },
      },
      network: 'manta-sepolia',
      chainID: 3441006,
    },
  },
  intentConfigs: {
    proofs: {
      storage_duration_seconds: 60,
      hyperlane_duration_seconds: 120,
      metalayer_duration_seconds: 180,
    },
  },
}
