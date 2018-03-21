var util = require('../../utilities.js');

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        if(message.mentions.members.size == 0){
            message.channel.send("User to unmute not mentioned");
            return;
        }
        if(message.mentions.members.first().roles.exists("name","Muted")){
            message.mentions.members.first().roles.remove([message.guild.roles.find("name","Muted")]);
            message.channel.send(`${message.mentions.members.first().nickname || message.mentions.users.first().username} has been unmuted`)
        }else{
            message.channel.send(`${message.mentions.members.first().nickname || message.mentions.users.first().username} is not muted`)
        }
}
}
