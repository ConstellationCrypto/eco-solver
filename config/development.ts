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
    uri: 'eco-mongo-db:27017',
    // uri: 'localhost:27017',
    dbName: 'eco-solver-local',
    enableJournaling: true,
  },
  redis: {
    connection: {
      host: 'eco-redis',
      // host: 'localhost',
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
        '0xE0356B8aD7811dC3e4d61cFD6ac7653e0D31b096', //usdc
        '0xb56415964d3F47fd3390484676e4f394d198374a', //usdt
      ],
      provers: ['0xC4d6985b9b333F333F78e4Cae5563BB009595A6C', '0xEADCeB003Cde57B7F0025baF2A1C29efaB497D53', ],
    },
    {
      network: 'manta-sepolia',
      chainID: 3441006,
      tokens: [
        '0x0652aEc2DeE0Fee9D05E614c95Ce8A01a7336cD8', //usdc
        '0xC040bB09ffF7EBb7FDf38831B7c582afddB2CcFE', //usdt
      ],
      provers: ['0xC4d6985b9b333F333F78e4Cae5563BB009595A6C', '0x907fE7e7B3a42f6ef447A401224F2927921FEA12', ],
    },
    {
      network: 'b3-testnet',
      chainID: 1993,
      tokens: [
        '0x72EC0cAC893bB5C34b39EE775dD0E6fefa8A8345', //usdc
        '0xA615b3A30F794100f226966251012c45EAb48e17', //usdt
      ],
      provers: ['0xC4d6985b9b333F333F78e4Cae5563BB009595A6C', '0xDD48D9629BfB2E02B3113775D1c035bF3045a063', ],
    },
    {
      network: 'base-sepolia',
      chainID: 84532,
      tokens: [
        '0xcE90A1FCF07d8F9048CC361846f59F379175A89c', //usdc
        '0x93Ff978322BD76eCE681C32D69A9643511a03FfF', //usdt
      ],
      provers: ['0xC4d6985b9b333F333F78e4Cae5563BB009595A6C', '0x037Cc07139CB979F768c164E8Ca89a1cFB70cfb1', ],
    },
  ],
  solvers: {
    33111: {
      solverAddress: '0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e',  
      targets: {
        '0xE0356B8aD7811dC3e4d61cFD6ac7653e0D31b096': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
        '0xb56415964d3F47fd3390484676e4f394d198374a': {
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
        '0x0652aEc2DeE0Fee9D05E614c95Ce8A01a7336cD8': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
        '0xC040bB09ffF7EBb7FDf38831B7c582afddB2CcFE': {
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
    1993: {
      solverAddress: '0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e',
      targets: {
        '0x72EC0cAC893bB5C34b39EE775dD0E6fefa8A8345': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
        '0xA615b3A30F794100f226966251012c45EAb48e17': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
      },
      network: 'b3-testnet',
      chainID: 1993,
      fee: {
        feeAlgorithm: 'linear',
        constants: {
          baseFee: 0,
          per100UnitFee: 0,
        },
      },
    },
    84532: {
      solverAddress: '0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e',
      targets: {
        '0xcE90A1FCF07d8F9048CC361846f59F379175A89c': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
        '0x93Ff978322BD76eCE681C32D69A9643511a03FfF': {
          contractType: 'erc20',
          selectors: ['transfer(address,uint256)'],
          minBalance: 1000,
          targetBalance: 20000,
        },
      },
      network: 'base-sepolia',
      chainID: 84532,
      fee: {
        feeAlgorithm: 'linear',
        constants: {
          baseFee: 0,
          per100UnitFee: 0,
        },
      },
    },
  },
  intentConfigs: {
    proofs: {
      storage_duration_seconds: 60,
      hyperlane_duration_seconds: 120,
      metalayer_duration_seconds: 180,
    },
  },
  // kms: {
  //   region: 'us-west-2',
  //   keyID: '0a74ee2e-cbd8-43d2-8ff9-85f39b581cf7',
  // },
}
