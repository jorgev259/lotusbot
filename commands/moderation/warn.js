var util = require('../../utilities.js');
var {MessageEmbed} = require("discord.js");

module.exports = {
    desc:"This is a description",
    async execute(client, message, param){
        if(!message.mentions.users.size) return message.channel.send('No user was mentioned')
        var issued = message.mentions.members.first()
        if(!client.data.warns[issued.id]) client.data.warns[issued.id] = []

        var warn = {'reason':'Not defined','issuer':message.author.id}
        if(param.length>2) warn.reason = param.slice(2,param.length).join(' ')
        client.data.warns[issued.id].push(warn)

        var embed = new MessageEmbed()
            .setColor(message.guild.me.displayColor)
            .setDescription(`${message.author} issued warn #${client.data.warns[issued.id].length} to ${issued}\nReason: ${warn.reason}`)
            .setTimestamp();

        await message.guild.channels.find('name','staff-log').send(embed)
        await message.channel.send(`${message.author} issued warn #${client.data.warns[issued.id].length} to ${issued}\nReason: ${warn.reason}`)
        if(client.data.warns[issued.id].length >= 3){
            issued.ban({ reason: warn.reason })
        } 
        await util.save(client.data.warns,'warns')
        message.delete()
    }
}