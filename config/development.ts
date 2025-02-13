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
  /*
  if (id === "33111-pre") {
    return {
      // Prover: "0xac3f4357d650109a94c4a977f6c327b140cbac37";
      IntentSource: "0x9Dae29Dd5C877979CC5eF930DEFf39AeD44C4C32",
      Inbox: "0xaF979B11477d202F9c9E5f077961305b80D175Aa",
      HyperProver: "0x64Ac4bb878926e308abc9dc7B927eac8293cc85c",
    };
  } else if (id === "3441006-pre") {
    return {
      IntentSource: "0x9Dae29Dd5C877979CC5eF930DEFf39AeD44C4C32",
      Inbox: "0xaF979B11477d202F9c9E5f077961305b80D175Aa",
      HyperProver: "0x3925016CD0508006e081Ae5d9be2e83503398672", // this is the metalayerprover: "0xCd906dD3b534a7ab400F510f4F951ca07357a7Bc",
    };
  }


  {
  "33111": { dont use these cuz otherwise they're the same, confusing
    "IntentSource": "0x9Dae29Dd5C877979CC5eF930DEFf39AeD44C4C32",
    "Inbox": "0xaF979B11477d202F9c9E5f077961305b80D175Aa",
    "HyperProver": "0x64Ac4bb878926e308abc9dc7B927eac8293cc85c",
    "MetalayerProver": "0x90451F5e8dFf388E8aF87c27467BFD9D0FE59b6F"
  },
  "3441006": {
    "IntentSource": "0x9Dae29Dd5C877979CC5eF930DEFf39AeD44C4C32",
    "Inbox": "0xaF979B11477d202F9c9E5f077961305b80D175Aa",
    "HyperProver": "0x3925016CD0508006e081Ae5d9be2e83503398672",
    "MetalayerProver": "0x90451F5e8dFf388E8aF87c27467BFD9D0FE59b6F"
  },
  "33111-pre": {
    "IntentSource": "0x9Dae29Dd5C877979CC5eF930DEFf39AeD44C4C32",
    "Inbox": "0xaF979B11477d202F9c9E5f077961305b80D175Aa",
    "HyperProver": "0x64Ac4bb878926e308abc9dc7B927eac8293cc85c",
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
      provers: ['0x64Ac4bb878926e308abc9dc7B927eac8293cc85c'],
    },
    {
      network: 'manta-sepolia',
      chainID: 3441006,
      tokens: [
        '0x6E4D0AEC0fd8081E1Fd1f17B9769600efC72B51c', //usdc
        '0x1a8Eff33abcB8E7754daeA05582F4f7c93a9c75F', //usdt
      ],
      provers: ['0x3925016CD0508006e081Ae5d9be2e83503398672'],
    },
  ],
  solvers: {
    33111: {
      solverAddress: '0xaF979B11477d202F9c9E5f077961305b80D175Aa',  
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
    },
    3441006: {
      solverAddress: '0xaF979B11477d202F9c9E5f077961305b80D175Aa',
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
