const args = require('args');
const path = require('path');

args.option('port', 'The port on which the server will be running', 3000)
    .option('validity', 'Time in minutes that a snapshot is valid', 10)
    .option('path', 'The path to the build directory', path.join(process.cwd(), 'build'));

const flags = args.parse(process.argv);

module.exports = flags;
