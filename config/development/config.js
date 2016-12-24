var path = require('path');
var cwd = process.cwd();

development = {
    // Note that these paths should be relative to the calling site
    certs: {
        keyFile: path.join(cwd, 'certs/server.key'),
        certFile: path.join(cwd, 'certs/server.crt'),
        chainFile: path.join(cwd, 'certs/server_int.crt')
    }
}

module.exports = development;
