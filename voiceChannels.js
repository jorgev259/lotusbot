var channels = require("../data/vc.json");

module.exports = function(client){
    client.on("ready",function(){
        client.on("voiceStateUpdate",function(oldMember,newMember){
            var newTextChannel = channels[newMember.voiceChannel.name];
            var oldTextChannel = channels[oldMember.voiceChannel.name];

            if(newTextChannel != undefined || oldTextChannel!=undefined){
                if(oldMember.voiceChannelID == undefined && newMember.voiceChannelID != undefined){
                    var newTextChannel = channels[newMember.voiceChannel.name];
                    if(newTextChannel != undefined){
                        newMember.addRole(newMember.guild.roles.find("name",newTextChannel));
                    }
                }else if(oldMember.voiceChannelID != undefined && newMember.voiceChannelID != undefined && oldMember.voiceChannelID != newMember.voiceChannelID){
                    if(newtextChannel != undefined){
                        newMember.addRole(newMember.guild.roles.find("name",newTextChannel));
                    }
                    if(oldtextChannel != undefined){
                        newMember.removeRole(newMember.guild.roles.find("name",oldTextChannel));
                    }
                }else if(oldMember.voiceChannelID != undefined && newMember.voiceChannelID == undefined){
                    if(oldtextChannel != undefined){
                        newMember.removeRole(newMember.guild.roles.find("name",oldTextChannel));
                    }
                }
            }
        })
    })
}
