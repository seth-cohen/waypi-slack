var SerialPort = require('serialport');
var sleep = require('sleep');

// Private constants
var PARITY = 'none';
var DATA_BITS = 8;
var STOP_BITS = 1;

// Exported Constants
var DIRECTIONS = {
    LEFT:  'left',
    RIGHT: 'right'
};

// BPI constructor
function BPI() {
    this.serialPort = {};
    this.currentScreenOffset = 0;
    this.maxLineCharCount = 0;
};

// LCD Screen details
var screen = {
    maxLineLength:        40,
    maxVisibleLineLength: 16,
    maxScreenOffset:      24,
    numLines:             2
};

/**
 * Initializes the serial device with the specified options
 *
 * @param {object} Object with the configuration options for the device
 *                 { location, baudRate }
 */
BPI.prototype.initSerial = function(options) {
    options = options || {};
    var deviceLocation = options.location || '/dev/ttyAMA0';
    var baudRate = options.baudRate || 9600;

    this.serialPort = new SerialPort(
        deviceLocation,
        {
            baudRate: baudRate,
            dataBits: DATA_BITS,
            parity:   PARITY,
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
};

/**
 * Sends the command to clear the screen. We need to wait 1ms before sending any further instructions
 */
BPI.prototype.clear = function() {
    // For some reason these instructions need to be sent as hex arrays?
    this.serialPort.write([0xFE, 0x01]);
    sleep.usleep(1000);
};

/**
 * Write data to the screen
 *
 * @param {(string|array|buffer)} The text to write to the string
 */
BPI.prototype.write = function(text) {
    this.serialPort.write(text);
};

/**
 * Move to position. Note, it is possible that this needs to be passed in as hex valuei
 *
 * @param {number} row      The row to move the cursor to (1 or 2)
 * @param {number} position The position within the row to move the cursor to (1 - 16)
 */
BPI.prototype.moveTo = function(row, position) {
    var cursorPos = row  == 1 ? 0x80 : 0xC0;
    cursorPos = cursorPos + (position - 1); 
    this.serialPort.write([0xFE, cursorPos]);
    sleep.usleep(1000);
};

/**
 * Bring the window screen position back to home. Scrolls window until currentScreenOffset is 0
 */
BPI.prototype.bringScreenHome = function() {
    while (this.currentScreenOffset > 0) {
        this.scrollText(DIRECTIONS.RIGHT);
    }
};

/**
 * Close the serial connection
 */
BPI.prototype.close = function() {
    this.serialPort.close();
};

/**
 * Scroll the text on both lines (BPI-216 limitation) in the directino given
 *
 * @param {string} The direction to scroll the text
 */
BPI.prototype.scrollText = function(direction) {
    if (direction === DIRECTIONS.LEFT) {
        if (this.currentScreenOffset < screen.maxScreenOffset) {
            this.serialPort.write([0xFE, 0x18]);
            this.currentScreenOffset++;
        }
    } else if (direction === DIRECTIONS.RIGHT) {
        if (this.currentScreenOffset > 0) {
            this.serialPort.write([0xFE, 0x1C]);
            this.currentScreenOffset--;
        }
    } else {
        console.log('Unrecognized direction', direction);
    }
};

// Export the serial class
module.exports.BPI = BPI;
module.exports.DIRECTIONS = DIRECTIONS;
