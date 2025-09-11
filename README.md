# Discord Avatars to OBS
Displays discord avatars in OBS browser source, when user is speaking / muted / deafened, visualizes it too, uses 2 websocket clients (discord app, obs browser source) and 1 server (node.js). Can be useful for displaying your discord friends speaking without stupid discord overlay when you are streaming <3

## Some info about this
- [Customization](#customization) of avatar displaying, you can make more customization with css in OBS
- You need to paste the script everytime you load discord, maybe you can automate this with vencord idk (`run.vbs` you can run automatically with windows auto-startup)
- You can open many obs browser sources (idk why you need more than 1)
- Didnt used client-server setup because browser js doesnt have websocket server, so i was used to choose client-server-client
- Doesnt show your avatar, because why you need your own?

## How to run
0. For start, check if you have node.js installed
1. Download libs with cmd command `cd assets & npm i`
2. Enable developer mode in Discord desktop app
3. Open developer tools with Ctrl + Shift + I
4. Open console and write "allow pasting", ignore that warning lol
5. Paste script to console and run it (its already in your clipboard)
6. Click "Enable speaking avatar capturing" in left upper corner of discord
7. Paste this link to OBS browser source: `http://localhost:62520/`
8. PROFIT!

## Customization
Works with [URL Query Strings](https://en.wikipedia.org/wiki/Query_string), doesnt care about uppercased letters
Parameter|Example|Description
-|-|-
filter|`filter=brightness`|the [filter](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) to use when user starts or ends speaking
filtervaluespeaking|`filtervaluespeaking=100%`|this value will be used by filter, when user starts speaking
filtervaluenotspeaking|`filtervaluenotspeaking=75%`|this value will be used by filter, when user ends speaking
avatarwidth|`avatarwidth=128px`|the width/height of avatars
muteiconx|`muteiconx=0px`|position of the mute icon (0 is right)
muteiconx|`muteicony=0px`|position of the mute icon (0 is left)
muteiconwidth|`muteiconwidth=0px`|the width/height of mute icon
rowgap|`rowgap=8px`|the gap between rows of avatars
columngap|`columngap=8px`|the gap between columns of avatars
reversex|`reversex=1` or `reversex=0`|if `1`, avatars will be placed from right to left
reversey|`reversey=1` or `reversey=0`|if `1`, avatars will be placed from down to up
borderradius|`borderradius=16px`|rounds the corners of avatars
transitionduration|`transitionduration=0.5s`|duration of transition between speaking and not speaking avatar
transition|`transition=ease`|[type of transition](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) between speaking and not speaking avatar

## How it works
1. Runs websocket server on node.js, which saves current avatars state (speaking, muted)
2. Sets script to your clipboard, you pasting it to discord devtools console
3. Starts websocket client in discord (lets call it devtools)
4. On pressing upper left button in discord desktop app, script tracking all changes of specific html elements and sends them to websocket server
5. Now you will make obs browser source with `http://localhost:62520/` link
6. And then websocket server sends all changes from devtools to this source