var BPI = require('./hardware/lcds/bpi-216.js');
var Q = require('q');

var scrolling = false;
var charCount = 0;

process.on('message', (m) => {
    console.log('message recieved in scrollworker', m);
    if(m.message === 'initDevice') {
        Q.async(scrollDevice)();
    } else if (m.message === 'scroll') {
        charCount = m.charCount;
        scrolling = true;
    } else if (m.message === 'stopScroll') {
        charCount = 0;
        scrolling = false;
    }
});

/**
 * Scroll the current device generator
 */        
function *scrollDevice() {
    var currentScroll = 0;
    var offscreenCharCount = charCount - 16;
    var direction = BPI.DIRECTIONS.LEFT;

    // ensure that we have a device and loop infinitely
    if (bpi && scrolling) {
        console.log('scrolling');
        console.log(bpi.scrollText);
        bpi.scrollText(direction);
        if (direction === BPI.DIRECTIONS.LEFT) {
            currentScroll++;
            if (currentScroll >= offscreenCharCount) {
                console.log('switch direction to right');
                direction = BPI.DIRECTIONS.RIGHT;
            }
        } else {
            currentScroll--;
            if (currentScroll <= 0) {
                console.log('switch direction to left');
                direction = BPI.DIRECTIONS.LEFT;
            }
        }
    }
}
