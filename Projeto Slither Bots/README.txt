

Using BrunexBots:

	1. Download the Bots zip file and extract it to a directory on your computer. 

	2. In chrome, go to manage extensions at chrome://extensions/ , enable developer mode with the toggle on the top right, then click load unpacked.

	3. Navigate to the directory which you extracted SnakeyRain to, select the SankeyRain folder, then click select folder.

	* If an error occurs when you clicked select folder, make sure SnakeyRain was the folder selected.

	4. Navigate to slither.io, click login and you should see a successful login message. If login is unsuccessful its possible all servers are in use.

	5. Then join a server and press the startAndStopBots key to start spawning bots. Some commonly used servers are banned from use and bots will not spawn there.  

Bot States:

	-Boost. Bots go fast. Enable with either a right mouse click or can be toggled with the boost key.
	-Follow. Bots follow the user. Enabled with the follow key.
	-Unfollow. Bots go towards the last location of the user's head. Enable with the follow key while follow is enabled.
	-Random. Bots travel in random directions. Enable with the random key.
	-Straight. Bots strightline. Enable with the straight key.
	-Copy. Bots copy the angle created by your mouse. Enable with the copy key.
	-Follow Mouse. Bots go towards the location of your mouse. Enable with the followMouse key.
	-Unfollow Mouse. Bots go towards the last location of your mouse. Enable with the followMouse key while follow mouse is enabled.
	-Rain. Bots create a rain pattern. Enable with the rain key.
	-Tornado. Bots create a tornado pattern centered at your location when the key was pressed. Enable with the tornado key.
	-Circle. Bots spin in a tight circle. After 30 seconds the bots will go back to follow and there is a 1 minute cooldown. Enable with the circle key.
	-Target. Bots follow a selected player. Can be enabled two different ways: A. by targetting a player with NTL (backspace backspace followed by the corresponding number) then press the target key.
		or B. By clicking a teammates name in the Players list.

Settings:

	The settings file is a javascript file and must follow proper syntax. It can be edited and saved with any text editor. Only values within parenthesis can be changed and after each set of parenthesis there must be a comma.
	After changing the settings file, if you'd like to ensure your syntax is correct, you can use the following:
	https://esprima.org/demo/validate.html

Key Bindings:
	
	The key binding values can be changed to any valid javascript event.key value. If you choose a value already in use by another application, including NTL,
	that key's other functionality will be superseded. There is support for NTL's target system and QQ message system. 

Characters:

	The name, skin, tag and cosmetic combination that bots spawn with are based on what is inputted into the character section.

Names:

	Names can be up to 24 characters long and must be comprised of ASCII printable characters.
	Do not use hurtful or inappropriate  names. You will be banned if caught doing so.

Skins:

	SnakeyRain only accepts valid NTL skin codes up to 250 characters long.  

Tags and Cosmetics:

	There are directory images for the tags and cosmetics included with SnakeyRain. Use these directories to find the number of the tag or cosmetic you wish to use.
	You can also used paid tags if you know the tag code by iputting the tag code inbetween the parenthesis. 
	
	IMPORTANT DISCLAIMER! When you spawn bots with a tag code you will be sending the unencrypted tag code to the SnakeyRain server. I do not and will not log or look 
	at these tag codes however if you want to be fully confident that your code remains a secret between you and NTL do not input your tag code into the settings file. 
	If you are not the owner of the tag ask the tag's owner for permission before using it.  If a tag owner reports improper use of a paid tag it may result in a ban. 

The settings file may contain an unlimited number of skins, names tags and cosmetics however the max number of snakey characters is 20 so its possible not all are utilized.

Hide:

	The interface can be toggled on and off with the hide key.

Toggle Player Count:

	By default, the server stops spawning bots when a certain player limit is reached. This prevents lockouts and makes the server much more playable for others. This can be disabled 
	with the togglePlayerCount key. Keep in mind that doing so will likely lock out the server for players attempting to join.

Snakey rotate by Aylina:
	Snakey rotate is included. Press right arrow to coil clockwise and left arrow to coil counter clockwise. Press either arrow to disable. 

Enjoy

-Brunex
