#!/usr/bin/env node
require('async-to-gen/register');

const micro = require('micro');

const flags = require('../flags');
const snapshotServer = require('../server');

const server = micro(snapshotServer);
server.listen(flags.port);
console.log(`🌏  Server listening on port ${flags.port}`)
