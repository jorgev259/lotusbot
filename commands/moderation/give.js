const types = ["badge", "background"]
const names = ["badges", "bgs"]

module.exports = {
    async execute(client, message, param, db){
        if(message.mentions.members.size < 1 || !message.mentions.everyone)  return message.channel.send("You forgot to mention an user!");
        if(param.length < 4) return message.channel.send("Not enough parameters provided. Example: >give @person <type of thing> <id>");
        if(!types.includes(param[2].toLowerCase())) return message.channel.send("Invalid item type");

        if(message.mentions.everyone){
            let members = await message.guild.members.fetch()
            let progress = await message.channels.send(`Progress 0 out of ${members.size} added`)
            let counter = 0;
            members.forEach(async member => {
                await db.run("INSERT INTO inventory (id,type,item) VALUES (?,?,?)",[member.id, names[types.indexOf(param[2].toLowerCase())], param[3].toUpperCase()])
                counter++;
                message.edit(`Progress ${counter} out of ${members.size} added`);
            })
            message.edit("Done!")
        }else{
            await db.run("INSERT INTO inventory (id,type,item) VALUES (?,?,?)", [message.mentions.users.first().id, names[types.indexOf(param[2].toLowerCase())], param[3].toUpperCase()])
            message.channel.send("Added item!");
        }
    }
}