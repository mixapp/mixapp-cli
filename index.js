#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
if (!process.argv[2]) {
	console.error('The first argument must be the command');
	return;
}

const modulePath = path.resolve(__dirname+ '/cmd/' + process.argv[2] + '.js');
if (!fs.existsSync(modulePath)) {
	console.error('Unknown command');
	return;
}

process.argv = [...process.argv.slice(3)];
require(modulePath)(process.env.PWD, ...process.argv);