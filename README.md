# Connections for the PI #
We are using a [BPI-216v1][BPI-216v1] for the 2x16 LCD screen

NOTE: The serial data line must be inverted. For this I simply took a 2n7000 N-channel
mosfet and used it as an inverter. Just need a pullup resistor and input resister. Additionally,
We are using a NPN transistor to act as a switch so that we don't turn the LCD screen on while
the PI is booting. This LCD will enter test mode - which we would not be able to get out of.

| ConX Node           | Details     	    	   	    	| 
| ------------------- | --------------------------------------- | 
| rPI PIN 2 (+5V)     | Connect to +5 on BPI			|
| rPI PIN 4 (+5V)     | Connect to the Drain of the 2n7000      |
| rPI PIN 6 (GND)     | Connect to the Source of the 2n7000     | 
| BPI Signal          | Connect to the Source of the 2n7000     |
| rPI PIN 8 (TX)      | Connect to the Gate of the 2n7000       |
| rPI PIN 12 (GPIO18) | Connect to Base of the NPN transistor  |
| rPI PIN 9 (GND)     | Connect to Collector of NPN transistor |
| BPI GND             | Connect to Emitter of NPN transistor   |


# Setting up the Slack App #
First ensure that you have admin privilages for your team. You will need this
in order to be able to integrate and authorize our application. There are a 

# Node Modules #
## serialport ##
This was an interesting one. Needed to build this one from source

## pi-gpio ##
Setting this one up properly was a bit of a challenge. Needed to install and build
gpio-admin. Yet, that was for an older version of Raspbian and the GPIO mappings weren't
correct. Needed to apply patch to src/gpio-admin.

## request ## 
We need this module so that we can send requests to the Slack API to post messages as 
well as for OAUTH. Installing this one is straight forward.



<!-- links -->
[BPI-216v1]: https://www.seetron.com/docs/bpi216mnl.pdf "PDF for the LCD screen"
