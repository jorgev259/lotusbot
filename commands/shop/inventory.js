const Discord = require('discord.js');
var util = require("../../utilities.js")

module.exports = {
    desc:"Displays your bought items",
    async execute(client, message, param, db){
            await util.userCheck(message.author.id,client,db);
            var userInfo = await db.get(`SELECT bg FROM exp WHERE id = ${message.author.id}`);

            var inventoryEmbed = new Discord.MessageEmbed();
            inventoryEmbed.color= message.member.displayColor;

            inventoryEmbed.author = {
                name: message.member.displayName,
                icon_url: message.author.displayAvatarURL(),
            }


            var bgs = "";
            client.data.inventory[message.author.id].bgs.forEach(element => {
                if(element == userInfo.bg){
                    bgs += `**${element}**\n`
                }else{
                    bgs += `${element}\n`
                }
            });
            if(bgs.length>0) inventoryEmbed.addField("Backgrounds",bgs);
            
            var badges = ""
            client.data.inventory[message.author.id].badges.forEach(element => {
                if(client.data.exp[message.author.id].badges.includes(element)){
                    badges += `**${element}**\n`
                }else{
                    badges += `${element}\n`
                }
            });
            if(badges.length>0) inventoryEmbed.addField("Badges",badges);

            var packs = "";
            Object.keys(client.data.items).forEach(element => {
                if(client.data.items[element].role && element.includes("Pack") && message.member.roles.exists("name", client.data.items[element].role)){
                    packs += `${element.split("Pack")[0]}\n`
                }
            })
            if(packs.length>0) inventoryEmbed.addField("Embed Packs",packs);

            message.author.send(inventoryEmbed);
    }
}
