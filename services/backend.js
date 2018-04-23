const Hapi = require('hapi');
const Path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Boom = require('boom');
let levelup = require('levelup');
let leveldown = require('leveldown');

// Determine if Production or Dev
const production = process.env.NODE_ENV === 'production';

// Twitch vars set in PM2
const secret = process.env.EXT_SECRET;
const client = process.env.EXT_CLIENT_ID;
const owner = process.env.EXT_OWNER_ID;

// JWT auth headers have this prefix
const bearerPrefix = 'Bearer ';

// Certs if running in dev mode.
if(!production) {
  const tls = {
    key: fs.readFileSync('conf/server.key'),
    cert: fs.readFileSync('conf/server.crt')
  };
}

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

  const channelId = payload.channel_id.toString();
  const participantId = req.params.participantId.toString();

  db.batch()
    .del(channelId)
    .put(channelId, participantId);

  return {};
}

function participantQueryHandler(req, h) {

  const payload = verifyAndDecode(req.headers.authorization);

  if (!payload) {
    throw Boom.unauthorized('invalid jwt');
  }


  const channelId = payload.channel_id.toString();

  let result = db.get(channelId);

  return result.then(resp => resp);
}

async function liftOff() {
  server.route({
    method: 'POST',
    path: '/participant/set',
    handler: participantHandler
  });

  server.route({
    method: 'GET',
    path: '/participant/get',
    handler: participantQueryHandler
  });

  await server.start();
}

liftOff();
