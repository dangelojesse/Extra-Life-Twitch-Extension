module.exports = {
  apps : [{
    name   : "teb",
    script : "./services/backend.js",
    env: {
      PORT: 8081,
      NODE_ENV: 'development',
      EXT_CLIENT_ID: 'YOUR_EXT_CLIENT_ID',
      EXT_SECRET: 'YOUR_EXT_SECRET',
      EXT_VERSION: 'YOUR_EXT_VERSION',
      EXT_OWNER_NAME: 'YOUR_EXT_OWNER_NAME'
    },
    env_production: {
      PORT: 80,
      NODE_ENV: 'production',
      EXT_CLIENT_ID: 'YOUR_EXT_CLIENT_ID',
      EXT_SECRET: 'YOUR_EXT_SECRET',
      EXT_VERSION: 'YOUR_EXT_VERSION',
      EXT_OWNER_NAME: 'YOUR_EXT_OWNER_NAME'
    }
  }, {
    name   : "tef",
    script : "./services/frontend.js",
    env: {
      PORT: 8080,
      NODE_ENV: 'development'
    },
    env_production: {
      PORT: 80,
      NODE_ENV: 'production'
    }
  }]
}
