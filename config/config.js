var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var defaults = require('./defaults.js');
var envConfig = {};

var name = path.join(__dirname, (process.env.NODE_ENV || 'development'),  'config.js');
if (fs.existsSync(name)) {
    console.log('file exists');
    envConfig = require(name);
}

module.exports = _.merge(defaults, envConfig);
