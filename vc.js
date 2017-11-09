var channels = require("../data/vc.json");
var util = require("./utilities.js");
var channelID = {};

module.exports = function(client){
    client.on('raw', data => {
        if(data.t === 'VOICE_STATE_UPDATE'){
            try{
                var guild = client.guilds.get(data.d.guild_id);
                var channel = null
                var member = guild.members.get(data.d.user_id);

                if(data.d.channel_id != null){
                    channel = guild.channels.get(data.d.channel_id);
                }

                if(channel === null){
                    var roles = member.roles.filter(r=>r.name.startsWith("🔊"));
                    if(roles.size==1){
                        member.removeRole(roles.first());
                    }else if(roles.size>1){
                        member.removeRoles(roles);
                    }
                    delete channelID[member.id];
                }else if(channelID[member.id] == undefined){
                    channelID[member.id] = channel.id;
                    if(channels[channel.name] != undefined){
                        member.addRole(guild.roles.find("name",channels[channel.name]),"Added voice channel role");
                    }
                }else if(channelID[member.id] != channel.id){
                    var roles = member.roles.filter(r=>r.name.startsWith("🔊"));
                    if(roles.size==1){
                        member.removeRole(roles.first(), "Removed voice channel role");
                    }else if(roles.size>1){
                        member.removeRoles(roles, "Removed voice channel roles");
                    }
                    channelID[member.id] = channel.id;

                    if(channels[channel.name] != undefined){
                        member.addRole(guild.roles.find("name",channels[channel.name]),"Added voice channel role");
                    }
                }
            }catch(e){
                util.log(member,e.message);
            }
        }
    })
}
