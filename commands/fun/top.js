const {MessageEmbed} = require("discord.js");

module.exports = {
    async execute(client, message, param, db){
        db.all("SELECT id,exp FROM exp  ORDER BY exp DESC LIMIT 10").then(list =>{
            let content="";
            let count = 0;
            list.forEach(async row => {
                count++;
                content += `${count}. ${member.nickname || member.user.username}: ${row.exp}\n`
            })
            message.channel.send(content)
            let embed = new MessageEmbed();
            embed.addField("Fandom Circle Ranking", content);
            message.channel.send(embed);
        })
    }
}