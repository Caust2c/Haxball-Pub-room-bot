/* Haxball bot 
Profanity expulsion done
admin assignment done (now without messsage displaying in chat, so yes now i can assign passcode for superadmin)
welcome message done
left message done
!bb to leave done
room can now be seen publicly done
superadmin such that all others lose admin
spam mute done, same message beyond 3rd time wont be seen and warnings will be sent
previous superadmins dont lose their priveleges on someone else putting command
To be done:-

20min admin rotation
shuffle players 
record function (haxreplays-pl api documentation and implementation needed)
change bot name to something else   (nothing seems to work)
if player leaves in middle of match give a warning  


 */
var room = HBInit({ roomName: "Prey's room", maxPlayers: 6, public: true });
var isRecording = false;
room.setDefaultStadium("Small");
room.setScoreLimit(3);
room.setTimeLimit(3);

var profanityList = ["nigger", "nig", "n1gger", "n!gger", "n*gger"];
var messageHistory = {};
var superAdminList = [];
var ongoingleft= [];

function isMatchOngoing() {
    var scores = room.getScores();
    if (scores) {
        return true;
    } else {
        return false;
    }
}
function containsProfanity(message) {
    var lowerMessage = message.toLowerCase();
    return profanityList.some((word) => lowerMessage.includes(word));
}

function updateAdmins() {
    var players = room.getPlayerList().filter((player) => player.id != 0);
    if (players.length == 0) return;
    if (players.find((player) => player.admin) != null) return;
    room.setPlayerAdmin(players[0].id, true);
}

room.onPlayerJoin = function(player) {
    room.sendAnnouncement("Welcome "+player.name+"! Join our discord! https://discord.gg/eGBYjjbnKZ",null, 0x00FFFF);
    updateAdmins();
}

room.onPlayerLeave = function(player) {
    updateAdmins();
    var players = room.getPlayerList(); 
   if(isMatchOngoing){
        ongoingleft.push(player.id)
   }
}

room.onPlayerChat = function(player, message) {
    if (!messageHistory[player.id]) {
        messageHistory[player.id] = { lastMessage: message, count: 1 };
    } else {
        
        if (messageHistory[player.id].lastMessage === message) {
            messageHistory[player.id].count++;
        } else {
           
            messageHistory[player.id] = { lastMessage: message, count: 1 };
        }
    }

    
    if (messageHistory[player.id].count >= 4) {
        room.sendAnnouncement("Please avoid spamming, " + player.name, player.id, 0xcc33ff);
        return false; 
    }
    if (containsProfanity(message)) {
        room.kickPlayer(player.id, "Profanity detected", false);
        room.sendAnnouncement(player.name + " was kicked for using profanity.");
        return false; 
    }
    
    if (message === "!bb") {
        room.kickPlayer(player.id, "Come back another time :)", false);
    }

    if (message === "!admin secret") {
        if (!superAdminList.includes(player.id)) {
            superAdminList.push(player.id);
        }

        room.setPlayerAdmin(player.id, true);
        room.sendAnnouncement(player.name + " has been made a superadmin.",null,0xb30000);
        var players = room.getPlayerList();
    
        
        for (var i = 0; i < players.length; i++) {
            
            if (players[i].id !== player.id && players[i].admin && !superAdminList.includes(players[i].id)) {
                room.setPlayerAdmin(players[i].id, false);
            }
        }
    
        return false; 
    }
}