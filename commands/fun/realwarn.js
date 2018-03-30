var util = require('../../utilities.js');
var {MessageEmbed} = require("discord.js");

module.exports = {
    desc:"This is a description",
    async execute(client, message, param){
        var roast = ["The ban hammer is on the way", "Oh boy they are on to you", "JAIL TIME!", "Maybe you should hide those lolis", "The punisher staff is pointing at you", "The viking of dissapointment is looking at you"];

        if(!client.data.realwarns) client.data.realwarns = {}
        if(!message.mentions.users.size) return message.channel.send('You forgot to mention an user, you dumb dumb.')
        var issued = message.mentions.members.first()
        if(!client.data.realwarns[issued.id]) client.data.realwarns[issued.id] = []

        var warn = {'reason':'Not defined','issuer':message.author.id}
        if(param.length>2) warn.reason = param.slice(2,param.length).join(' ')
        client.data.realwarns[issued.id].push(warn)

        var embed = new MessageEmbed()
            .setColor(message.guild.me.displayColor)
            .setDescription(`${message.author} issued warn #${client.data.realwarns[issued.id].length} to ${issued}\nReason: ${warn.reason}`)
            .setTimestamp();

        message.channel.send(`${message.author} issued warn #${client.data.realwarns[issued.id].length} to ${issued}.\n ${roast[Math.floor(Math.random()*roast.length)]}`)
    }
}