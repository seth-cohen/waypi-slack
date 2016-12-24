var https = require('https');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var gpio = require('pi-gpio');
var process = require('process');
var request = require('request');
var config = require('./config/config.js');
var BPI = require('./hardware/lcds/bpi-216.js');
var sethbot = require('./sethbot');

// Slack Credentials
var clientId = config.slack.clientId;
var clientSecret = config.slack.clientSecret; 
var botToken = config.slack.bot.token;

// App configuration - Slack requires that the endpoints that it hits for its webhooks
// are served over https
var app = express();
console.log(config);
var privateKey = fs.readFileSync(config.certs.keyFile, 'utf8');
var certificate = fs.readFileSync(config.certs.certFile, 'utf8');
var chain = fs.readFileSync(config.certs.chainFile, 'utf8');

// Typically, we have the serial port Ground connected through some type of switch.
// reason being is that the BPI-216 will enter test mode if connected during startup 
// Before we open the port let's connect ground
// Instantiate a new BPI-216 object
var bpi = new BPI();
gpio.open(12, 'output', function() {
    gpio.write(12, 1, function(data) {
        console.log('setting high: ' + data);
        bpi.initSerial();
    });
});

// Using third party body-parser to make it easier to access the POST body
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// This endpoing is just for some browser fun.
app.get('/', function (req, res) {
    console.log(req.query);
    res.send('Hello World, from Pi part 3');
});

// POST requests sent to / should echo the data and print to the serial port
// Currently we need to support responding with the challenge from Slack
app.post('/', function (req, res) {
    console.log(req.body);
    
    bpi.clear();
    bpi.write('Hello from Serial port');
    res.send(req.body.challenge);
});

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({'Error': 'Looks like we\'re not getting code.'});
        console.log('Looks like we\'re not getting code.');
    } else {
        // We'll do a GET call to Slack's 'oauth.access' endpoint, passing our app's client ID, client secret, and the code we just got as query
        // parameters.
        request({
            url: config.slack.apiEndpoint + config.slack.oauth, //URL to hit
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, //Query string data
            method: 'GET' 

        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);
            }
        });
    }
});

// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/ngrok', function(req, res) {
    res.send('This was a successful test.');
});

// Endpoint to respond with the challenge
app.post('/hooks', function(req, res) {
    if (req.body.type === 'url_verification') {
        console.log('responding to challenge');
        var challenge = req.body.challenge;
        res.send(challenge);
    } else if (req.body.type === 'event_callback') {
        console.log('event_callback');
        // Just need to send a response or else Slack will think we didn't get it and keep hitting our EP
        res.send({'ack': 'Just acking the message hook'});
        var event = req.body.event;
        if (event.type === 'message') {
            // We would end up in an infinite loop if we process bot messages. Also, we don't really care about deletes/chages
            if (!event.subtype ||  ['bot_message', 'message_deleted', 'message_changed'].indexOf(event.subtype) === -1) {
                // Parse the text to see if it is a message that we care about
                var matchLines = sethbot.parseMessageText(event.text);
                if (matchLines && matchLines.length >= 2) {
                    console.log('Clearing the screen');
                    bpi.clear();
                    bpi.move(0x80);
                    bpi.write(matchLines[0]);

                    bpi.move(0xC0);
                    bpi.write(matchLines[1]);

                    console.log('sending message request');
                    request({
                        url: config.slack.apiEndpoint + config.slack.postMessage, //URL to hit
                        form: {
                            token: botToken,
                            channel: event.channel,
                            text: 'Check the display - echoing your message there',
                            username: 'Sethbot'
                        },
                        method: 'POST' 
                    }, function (error, response, body) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(body);
                        }
                    });
                }
            }
        }
    }
});

// Set up the HTTPS server given our loaded credentials
var credentials = {key: privateKey, cert: certificate, ca: chain};
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(3000, function () {
    console.log('App listening on port 3000!');
}); 

// Handle SIGINT so we can close resources on ctrl+c
process.on('SIGINT', function() {
    console.log('Shutting down gracefully');
    gpio.close(12, function() {});
    bpi.close();
    process.exit();
});
