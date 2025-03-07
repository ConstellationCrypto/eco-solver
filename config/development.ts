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
    // uri: 'eco-mongo-db:27017',
    uri: 'localhost:27017',
    dbName: 'eco-solver-local',
    enableJournaling: true,
  },
  redis: {
    connection: {
      // host: 'eco-redis',
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
  /*

  {
  "33111": { dont use these cuz otherwise they're the same, confusing
    "IntentSource": "0x587FF7656A0Da8b17Ff861caD7B8DFAB51c113f8",
    "Inbox": "0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e",
    "HyperProver": "0xEADCeB003Cde57B7F0025baF2A1C29efaB497D53",
    "MetalayerProver": "0xC4d6985b9b333F333F78e4Cae5563BB009595A6C"
  },
  "3441006": {
    "IntentSource": "0x587FF7656A0Da8b17Ff861caD7B8DFAB51c113f8",
    "Inbox": "0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e",
    "HyperProver": "0x907fE7e7B3a42f6ef447A401224F2927921FEA12",
    "MetalayerProver": "0xC4d6985b9b333F333F78e4Cae5563BB009595A6C"
  },
  "33111-pre": {
    "IntentSource": "0x587FF7656A0Da8b17Ff861caD7B8DFAB51c113f8",
    "Inbox": "0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e",
    "HyperProver": "0xEADCeB003Cde57B7F0025baF2A1C29efaB497D53",
    "MetalayerProver": "0x0A8eCD8ac5D801bF3AaFFBEe0C6cEfEEBf7cbFF0"
  }
}
  */
  intentSources: [
    {
      network: 'Curtis',
      chainID: 33111,
      tokens: [
        '0x804AAA73AA2732B2f84bB5E768Dc50003F0b3f78', //usdc
        '0x8Cb9a6A8692D3379F237CDE946B69888462D3c77', //usdt
      ],
      provers: ['0xC4d6985b9b333F333F78e4Cae5563BB009595A6C', '0xEADCeB003Cde57B7F0025baF2A1C29efaB497D53', ],
    },
    {
      network: 'manta-sepolia',
      chainID: 3441006,
      tokens: [
        '0x6E4D0AEC0fd8081E1Fd1f17B9769600efC72B51c', //usdc
        '0x1a8Eff33abcB8E7754daeA05582F4f7c93a9c75F', //usdt
      ],
      provers: ['0xC4d6985b9b333F333F78e4Cae5563BB009595A6C', '0x907fE7e7B3a42f6ef447A401224F2927921FEA12', ],
    },
  ],
  solvers: {
    33111: {
      solverAddress: '0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e',  
      targets: {
        '0x804AAA73AA2732B2f84bB5E768Dc50003F0b3f78': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
        '0x8Cb9a6A8692D3379F237CDE946B69888462D3c77': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
      },
      network: 'Curtis',
      chainID: 33111,
      fee: {
        feeAlgorithm: 'linear',
        constants: {
          baseFee: 0,
          per100UnitFee: 0
        }
      }
    },
    3441006: {
      solverAddress: '0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e',
      targets: {
        '0x6E4D0AEC0fd8081E1Fd1f17B9769600efC72B51c': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
        '0x1a8Eff33abcB8E7754daeA05582F4f7c93a9c75F': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
      },
      network: 'manta-sepolia',
      chainID: 3441006,
      fee: {
        feeAlgorithm: 'linear',
        constants: {
          baseFee: 0,
          per100UnitFee: 0
        }
      }
    },
  },
  intentConfigs: {
    proofs: {
      storage_duration_seconds: 60,
      hyperlane_duration_seconds: 120,
      metalayer_duration_seconds: 180,
    },
  },
  kms: {
    region: 'us-west-2',
    keyID: '0a74ee2e-cbd8-43d2-8ff9-85f39b581cf7',
  },
}
