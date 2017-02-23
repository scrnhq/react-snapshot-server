const args = require('args');

args.option('port', 'The port on which the server will be running', 3000)
    .option('snapshot_duration', 'Time in minutes that a snapshot is valid', 10);

const flags = args.parse(process.argv);

module.exports = flags;
