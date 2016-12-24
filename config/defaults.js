// Default configurations - load environment variables prior to launching app
var defaults = {
    slack: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        bot:{
            name: 'Sethbot',
            token: process.env.BOT_TOKEN
	      },
        apiEndpoint: 'https://slack.com/api/',
        postMessage: 'chat.postMessage',
        oath: 'oauth.access'
    }
};

module.exports = defaults;
