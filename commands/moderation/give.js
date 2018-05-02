var {MessageEmbed} = require("discord.js");

const types = ["badge", "background"];
const names = ["badges", "bgs"];

module.exports = {
    async execute(client, message, param, db){
        if(message.mentions.members.size < 1 && !message.mentions.everyone)  return message.channel.send("You forgot to mention an user!");
        if(param.length < 4) return message.channel.send("Not enough parameters provided. Example: >give @person <type of thing> <id>");
        if(!types.includes(param[2].toLowerCase())) return message.channel.send("Invalid item type");

        if(message.mentions.everyone){
            let members = await message.guild.members.fetch()
            let progress = await message.channel.send(`Progress 0 out of ${members.size} added`)
            let counter = 0;
            members.forEach(async member => {
                await db.run("INSERT INTO inventory (id,type,item) VALUES (?,?,?)",[member.id, names[types.indexOf(param[2].toLowerCase())], param[3].toUpperCase()])
                counter++;
                await progress.edit(`Progress ${counter} out of ${members.size} added`);
            })
            progress.edit("Done!");
            log(message, `${message.author} added the ${param[2].toLowerCase()} ${param[3].toUpperCase()} to everyone on the server. Huzzah!`)
        }else{
            await db.run("INSERT INTO inventory (id,type,item) VALUES (?,?,?)", [message.mentions.users.first().id, names[types.indexOf(param[2].toLowerCase())], param[3].toUpperCase()])
            message.channel.send("Added item!");
            log(message, `${message.author} added the ${param[2].toLowerCase()} ${param[3].toUpperCase()} to ${message.mentions.members.first()}`)
        }
    }
}

function log(message, out){
    var embed = new MessageEmbed()
    .setColor(message.guild.me.displayColor)
    .setDescription(out)
    .setTimestamp();

    message.guild.channels.find('name','staff-log').send(embed)
}