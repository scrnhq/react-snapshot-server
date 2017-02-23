#!/usr/bin/env node
const micro = require('micro');

const flags = require('../lib/flags');
const snapshotServer = require('../lib/server');

const server = micro(snapshotServer);
server.listen(flags.port);
console.log(`🌏  Server listening on port ${flags.port}`)
