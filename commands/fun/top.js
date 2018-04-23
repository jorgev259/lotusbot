const {MessageEmbed} = require("discord.js");

module.exports = {
    async execute(client, message, param, db){
        const list = await db.all("SELECT id,exp FROM exp  ORDER BY exp DESC LIMIT 10");
        let content="";
        let count = 0;
        list.forEach(async row => {
            let member = await message.guild.members.fetch(row.id);
            count++;

            content += `${count}. ${member.nickname || member.user.username}: ${row.exp}\n`
        })

        let embed = new MessageEmbed();
        embed.setTitle("Fandom Circle Ranking").setDescription(content);
        message.channel.send(embed);
    }
}