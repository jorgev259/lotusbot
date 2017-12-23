var channels = require("../data/vc.json");
var util = require("./utilities.js");
var channelID = {};

module.exports = function(client){
    client.on("voiceStateUpdate",(oldMember,newMember)=>{
        var newid = undefined;
        var oldid = undefined;
        if(oldMember.voiceChannel != undefined){
            oldid = oldMember.voiceChannel.id;
        }
        if(newMember.voiceChannel != undefined){
            newid = newMember.voiceChannel.id;
        }

        if(newid != oldid){
            var guild = oldMember.guild;

            if(oldid != undefined){
                var oldChannel = guild.channels.get(oldid).name;
                if(channels[oldChannel]){
                    switch(channels[oldChannel].type){
                        case "role":
                            oldMember.removeRole(guild.roles.find("name",channels[oldChannel].name));
                            break;

                        case "permission":
                            guild.channels.find("name",channels[oldChannel].name).overwritePermissions(oldMember,{VIEW_CHANNEL:FALSE},"Denied access to channel (voice)")
                            break;
                    }
                }
            }
            if(newid != undefined){
                var newChannel = guild.channels.get(newid).name;
 
                if(channels[newChannel]){
                    switch(channels[newChannel].type){
                        case "role":
                            newMember.addRole(guild.roles.find("name",channels[newChannel].name));
                            break;

                        case "permission":
                            guild.channels.find("name",channels[newChannel].name).overwritePermissions(newMember,{VIEW_CHANNEL:TRUE},"Allowed access to channel (voice)")
                            break;
                    }
                }
            }
        }
    })
}
