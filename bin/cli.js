#!/usr/bin/env node
const micro = require('micro');

const flags = require('../lib/flags');
const SnapshotServer = require('../lib/server');

const server = micro(new SnapshotServer(flags));
server.listen(flags.port);
console.log(`🌏  Server listening on port ${flags.port}`)
