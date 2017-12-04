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

                if((channel === null || channel.id != channelID[member.id]) && channels[guild.channels.get(channelID[member.id]).name]){
                    guild.channels.find("name",channels[channel.name]).overwritePermissions(member,{VIEW_CHANNEL:false},"Allowed access to channel (voice)")
                    delete channelID[member.id];
                }

				if(channel != null){
					channelID[member.id] = channel.id;
                    if(channels[channel.name]){
						guild.channels.find("name",channels[channel.name]).overwritePermissions(member,{VIEW_CHANNEL:true},"Allowed access to channel (voice)")
                    }
				}
            }catch(e){
                util.log(member,e.message);
            }
        }
    })
}
