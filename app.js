const Hapi = require('hapi');
const Path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Boom = require('boom');
var levelup = require('levelup');
var leveldown = require('leveldown');

// Determine if Production or Dev
const production = process.env.NODE_ENV === 'production';

// Twitch vars set in PM2
const secret = process.env.EXT_SECRET;
const client = process.env.EXT_CLIENT_ID;
const owner = process.env.EXT_OWNER_ID;

// JWT auth headers have this prefix
const bearerPrefix = 'Bearer ';

// Certs if running in dev mode.
const tls = {
  key: fs.readFileSync('conf/server.key'),
  cert: fs.readFileSync('conf/server.crt')
};

// create new server instance
const server = new Hapi.Server({
  host: 'localhost',
  port: process.env.PORT,
  tls: !production ? tls : null,
  routes: {
    files: {
      relativeTo: Path.join(__dirname, 'public')
    },
    cors: {
      origin: ['*']
    }
  }
});

// Create level database
let db = levelup(leveldown('./participant'))

function verifyAndDecode(header) {
  try {
    if (!header.startsWith(bearerPrefix)) {
      return false;
    }

    const token = header.substring(bearerPrefix.length);
    const secret64 = Buffer.from(secret, 'base64');
    return jwt.verify(token, secret64, { algorithms: ['HS256'] });
  } catch (e) {
    return false;
  }
}

function participantHandler(req, h) {
  const payload = verifyAndDecode(req.headers.authorization);

  if (!payload) {
    throw Boom.unauthorized('invalid jwt');
  }

  const channelId = payload.channel_id;
  console.log(payload);
  db.put(channelId, req.payload.participantId, function (err) {
  console.log(`
    Wah!
    ${err} failed to save to database, please try again.`);
  });

  return channelId;
}

function participantQueryHandler(req, h) {
  const payload = verifyAndDecode(req.headers.authorization);

  if (!payload) {
    throw Boom.unauthorized('invalid jwt');
  }

  const channelId = payload.channel_id;

  db.get(channelId, function (err, value) {
    console.log(`
      Wah!
      ${err} failed to get data from the database, please try again.`);

    return value;
  });

  return 'yay'
}

async function liftOff() {
  if (!production) {
    await server.register({
      plugin: require('inert')
    });
  }

  server.route({
    method: 'POST',
    path: '/participant/id/{participantId?}',
    handler: participantHandler
  });

  server.route({
    method: 'GET',
    path: '/participant/query',
    handler: participantQueryHandler
  });

  // Serves UI Portion not needed for
  // Production
  if (!production) {
    server.route({
      method: 'GET',
      path: '/static/scripts/{file*}',
      handler: {
        directory: {
          path: 'static/scripts'
        }
      }
    });

    server.route({
      method: 'GET',
      path: '/static/images/{file*}',
      handler: {
        directory: {
          path: 'static/images'
        }
      }
    });

    server.route({
      method: 'GET',
      path: '/static/styles/{file*}',
      handler: {
        directory: {
          path: 'static/styles'
        }
      }
    });

    server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: './'
        }
      }
    });
  }
  await server.start();
  console.log('Server started at: ' + server.info.uri);
}

liftOff();
