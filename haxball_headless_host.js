
var room = HBInit({ roomName: "Add your own room name", maxPlayers: 6, public: true });
var isRecording = false;
room.setDefaultStadium("Small");
room.setScoreLimit(3);
room.setTimeLimit(3);

var profanityList = []; //Enter your own set of banned words here 'xyz','abc'...
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
    room.sendAnnouncement("Welcome "+player.name+"! Join our discord! ",null, 0x00FFFF);//add link to your discord maybe
    updateAdmins();
    if (ongoingleft.includes(player.id)) {
        room.sendAnnouncement("Please don't leave midgame " + player.name, player.id, 0xcc33ff);
    }
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

    if (message === "!superadmin secret") { //use your own  password here (like ads123 instead of secret here) and don't worry this wont reflect in chat to everyone
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