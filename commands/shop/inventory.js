const Discord = require('discord.js');
var util = require("../../utilities.js")

module.exports = {
    desc:"Displays your bought items",
    async execute(client, message, param, db){
        var inventoryEmbed = new Discord.MessageEmbed();
        inventoryEmbed.color= message.member.displayColor;

        inventoryEmbed.author = {
            name: message.member.displayName,
            icon_url: message.author.displayAvatarURL(),
        }
        let userInfo = await db.get(`SELECT bg FROM exp WHERE id = ${message.author.id}`);

        var bgs = "";
        var bgsArray = (await db.all(`SELECT item from inventory WHERE id=${message.author.id} AND type="bgs"`)).map(e=>e.item);
        bgsArray.forEach(element => {
            if(element.item == userInfo.bg){
                bgs += `**${element.item}**\n`
            }else{
                bgs += `${element.item}\n`
            }
        });
        if(bgsArray.length>0) inventoryEmbed.addField("Backgrounds",bgs);
            
        var badges = "";
        let invArray = (await db.all(`SELECT item from inventory WHERE id=${message.author,id} AND type="badges"`)).map(e=>e.item);
        let badgesArray = (await db.all(`SELECT item from badges WHERE id=${message.author,id}`)).map(e=>e.item);
        invArray.forEach(element => {
            if(badgesArray.includes(element.type)){
                badges += `**${element.type}**\n`
            }else{
                badges += `${element.type}\n`
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
