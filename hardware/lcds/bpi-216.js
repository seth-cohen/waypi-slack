var SerialPort = require('serialport');
var sleep = require('sleep');

var PARITY = 'none';
var DATA_BITS = 8;
var STOP_BITS = 1;

// BPI constructor
var BPI = function() {
    this.serialPort = {};
    this.needsScrolling = false;
}

BPI.prototype.DIRECTION = {
    left: 'left',
    right: 'right'
};

/**
 * Initializes the serial device with the specified options
 *
 * @param {object} Object with the configuration options for the device
 *                 { location, baudRate }
 */
BPI.prototype.initSerial = function(options) {
    var options = options || {};
    var deviceLocation = options.location || '/dev/ttyAMA0';
    var baudRate = options.baudRate || 9600;

    this.serialPort = new SerialPort(
        deviceLocation,
        {
            baudRate: baudRate,
            dataBits: DATA_BITS,
            parity: PARITY,
            stopBits: STOP_BITS
        }
    );
    this.serialPort.on('open', (function () {
        console.log('Port open. Clearing the port');
        this.clear();
    }).bind(this));
    this.serialPort.on('close', function () {
        console.log('Port closing.');
    });
    this.serialPort.on('data', function (data) {
        console.log('Sending data: ' + data);
    });
}

/**
 * Sends the command to clear the screen. We need to wait 1ms before sending any further instructions
 */
BPI.prototype.clear = function() {
    // For some reason these instructions need to be sent as hex arrays?
    this.serialPort.write([0xFE]);
    this.serialPort.write([0x01]);
    sleep.usleep(1000);
}

/**
 * Write data to the screen
 *
 * @param string The text to write to the string
 */
BPI.prototype.write = function(text) {
    this.serialPort.write(text);
}

/**
 * Move to position. Note, it is possible that this needs to be passed in as hex valuei
 *
 * @param number position The position on the screen to move the cursor to
 */
BPI.prototype.move = function(position) {
    this.serialPort.write([0xFE]);
    this.serialPort.write([position]);
    sleep.usleep(1000);
}

/**
 * Close the serial connection
 */
BPI.prototype.close = function() {
    this.serialPort.close();
}

/**
 * Scroll the text on both lines (BPI-216 limitation) in the directino given
 *
 * @param {string} The direction to scroll the text
 */
BPI.prototype.scrollText = function(direction) {
    if (direction === this.DIRECTION.left) {
        this.serialPort.write([0xFE, 0x18]);
    } else if (direction === this.DIRECTION.right) {
        this.serialPort.write([0xFE, 0x1C]);
    } else {
        console.log('Unrecognized direction');
    }
}

// Export the serial class
module.exports = BPI;
