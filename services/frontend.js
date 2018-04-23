const Hapi = require('hapi');
const Path = require('path');
const fs = require('fs');

// Certs if running in dev mode.
const tls = {
  key: fs.readFileSync('conf/server.key'),
  cert: fs.readFileSync('conf/server.crt')
};

// create new server instance
const server = new Hapi.Server({
  host: 'localhost',
  port: process.env.PORT,
  tls: tls,
  routes: {
    files: {
      relativeTo: Path.join(__dirname, '../public')
    },
    cors: {
      origin: ['*']
    }
  }
});

async function liftOff() {
  await server.register({
    plugin: require('inert')
  });


  server.route({
    method: 'GET',
    path: '/static/scripts/vendor/{file*}',
    handler: {
      directory: {
        path: 'static/scripts/vendor'
      }
    }
  });

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

  await server.start();
}

liftOff();
