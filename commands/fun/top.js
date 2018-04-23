const {MessageEmbed} = require("discord.js");

module.exports = {
    async execute(client, message, param, db){
        const list = await db.all("SELECT id,exp FROM exp  ORDER BY exp DESC LIMIT 10");
        let content="";
        let count = 0;
        list.forEach(async row => {
            let member;
            try{
                member = await message.guild.members.fetch(row.id);
            }catch(e){
                member = {nickname: "Unknown Member"}

            }
            count++;

            content += `${count}. ${member.nickname}: ${row.exp}\n`
        })

        let embed = new MessageEmbed();
        embed.addField("Fandom Circle Ranking", content);
        message.channel.send(embed);
    }
}