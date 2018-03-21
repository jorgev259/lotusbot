var util = require('../../utilities.js');
var {MessageEmbed} = require("discord.js");

module.exports = {
    desc:"This is a description",
    async execute(client, message, param){
        var issued = message.member;
        if(message.mentions.users.size && message.member.roles.exists("name","Staff Team")) issued = message.mentions.members.first()        
        if(!client.data.warns[issued.id]) client.data.warns[issued.id] = []

        var warnsMsg = ``;
        for(var i=0;i<client.data.warns[issued.id].length;i++){
            warnsMsg += `${i+1}) ${client.data.warns[issued.id][i].reason}\n`
        }

        var embed = new MessageEmbed()
            .setColor(issued.displayColor)
            .setDescription(warnsMsg)
            .setTitle("Issued warns")
            .setAuthor(issued.displayName, issued.user.displayAvatarURL());

        message.channel.send(embed)
    }
}