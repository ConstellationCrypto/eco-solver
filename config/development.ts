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
      IntentSource: "0xD7f316e387107b90dFBBDCb07bEC7280A729ce88",
      Inbox: "0x04fA0CeB5eaAf33084DDd4A7cda74F01767B4507",
      HyperProver: "0x3e27B444B5E543cbFF449115DE4a36705a891F82",
    };
  } else if (id === "3441006-pre") {
    return {
      IntentSource: "0x7e0400Eb1508f4c8A2C33a46c7Ce308C650ccDe6",
      Inbox: "0xC8CFd1aA8153Ec5F41d8F6FBCf8ec4B1AD8b779c",
      HyperProver: "0x7d89991BFF4B2665f7Ace724789Cf2ACBBF46A39", // this is the metalayerprover: "0xCd906dD3b534a7ab400F510f4F951ca07357a7Bc",
    };
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
      provers: ['0x3e27B444B5E543cbFF449115DE4a36705a891F82'],
    },
    {
      network: 'manta-sepolia',
      chainID: 3441006,
      tokens: [
        '0x6E4D0AEC0fd8081E1Fd1f17B9769600efC72B51c', //usdc
        '0x1a8Eff33abcB8E7754daeA05582F4f7c93a9c75F', //usdt
      ],
      provers: ['0x7d89991BFF4B2665f7Ace724789Cf2ACBBF46A39'],
    },
  ],
  solvers: {
    33111: {
      solverAddress: '0x04fA0CeB5eaAf33084DDd4A7cda74F01767B4507',
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
      solverAddress: '0xC8CFd1aA8153Ec5F41d8F6FBCf8ec4B1AD8b779c',
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
