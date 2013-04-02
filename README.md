leap-JS-RockPaperScissors
=========================

A text-only fully functional/playable demo of Rock Paper Scissors game for LEAP Motion Devices. 
The game don't have framework/library dependencies - It's pure JavaScript. The intention of 
demo was to do a first live check of the very remarkable and precise LEAP Motion pointable 
detection capabilities. This is a simple textual demo made to bootstrap my relationship with 
LEAP motion device and to discuss some detection strategies possibly common to other projects.

Live try
--------

If you have a LEAP Motion device, try it on address:

http://www.wacawacawaca.com/nandico/leap-JS-RockPaperScissors/RockPaperScissorsJS.html

Detection strategy
------------------

The system counts the pointables of most proeminent hand in z-axis to avoid interferences. 
The z-axis is used to avoid head interference too. Actually the system makes the distinction:

- 0 or 1 pointables: <b>ROCK</b> (avoid thumb as a pointable interference)
- 2 pointables: <b>SCISSORS</b> (index and middle finger are pretty well detected, without interferences)
- More than 2 pointables: <b>PAPER</b>

The strategy works pretty well if the hand is placed in sensor in the correct form. 

Some test users put the "PAPER" position intuitivelly in a wrong way (with the fingers placed together). 
This cause a wrong detection - the pointables not well distinguished by the sensor when are closer to each other.

Other users stays with the hand in the ROCK position above the sensor during the countdown. This 
generates a problem too: The system register the ROCK position in this case and the user will always 
lose - CPU makes a fulminant attack if user place a hand before GO signal. YES, CPU cheats if user 
puts the hand in the wrong time.

To ensure correct detection the system looks for some amount of frames in a stable position before 
register the movement with a buffer. This improved the entire detection strategy.

Other
-----

Contributions are welcome. I will pray for someone creates a graphical interface or improve the system to support 
rock-paper-scissors-lizard-spock game :)
