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
