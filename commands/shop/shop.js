const Discord = require('discord.js');
var path = require("path")
var util = require("../../utilities.js")
const fs = require('fs');
var glob = require('glob');

module.exports = {
    desc:"This is a description",
    alias:["buy"],
    async execute(client, message, param, db){
        await util.userCheck(message.author.id,client);
        let items = client.data.items;

        if (!param[1]){               
            const embed = new Discord.MessageEmbed()
            .setColor(0xD4AF37)

            var tempDesc = '';
            for (var c in items) {
                tempDesc += `${items[c].name} - $${items[c].price} - ${items[c].desc}\n`;
            }
            embed.addField('Available items', tempDesc);
            return message.author.send(embed);
        }

        let itemName = param.slice(1).join(" ").trim().toLowerCase();
        if (!items[itemName]) {
            return message.author.send({embed: {
                color: 0,
                fields: [{
                    name: "Fandom Circle - Shop",
                    value: `**Item ${itemName} not found.**`                        
                }]
            }})
        }

        let item = items[itemName];
        let itemPrice = item.price;
        let itemDesc = item.desc;
          
        var user = await db.get(`SELECT money,lastDaily FROM exp WHERE id = ${message.author.id}`);     
        /*if (Number.isInteger(itemPrice) && user.money < itemPrice) {
                return message.author.send({embed: {
                    color: 16727113,
                    fields: [{
                        name: "Fandom Circle - Shop",
                        value: `**You don't have enough money for this item.**`
                    }]
            }});
        }*/

        switch(itemName){
            case "embed pack":
                var proposal = await message.author.send("Write the name of the desired pack (You can see them here https://www.fandomcircle.com/shop-1#PROFILES)")
                var filter = m => m.author.id == message.author.id;
                proposal.channel.awaitMessages(filter, { max: 1 })
                .then(async collected => {
                    var m = collected.first();
                    if(!client.data.items["embed pack"].packs.hasOwnProperty(m.content.toLowerCase())) return m.channel.send(`Couldnt find the pack ${m.content}`);

                    var item = client.data.items["embed pack"].packs[m.content.toLowerCase()];
                    //if(unavailable.includes(number)) return m.author.send(`The background code ${number} is no longer available for purchase. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)                                                  
                    if(user.money < item.price) return m.author.send("You cant afford this embed pack");

                    if(!message.member.roles.exists("name",item.role)){
                        user.money += -item.price;
                        await db.run(`UPDATE exp SET money =${user.money} WHERE id = ${message.author.id}`);
                        message.member.roles.add(message.guild.roles.find("name", item.role));
                        message.author.send('**You bought ' + itemName + '!**');
                        //message.guild.channels.find("name",item.channel).send(`<@${message.author.id}>`).then(m=>m.delete({"reason":"New channel ping"}))
                    }else{
                        message.author.send('**You already have this embed pack!**')
                    }
                })                              
                break;

            case "nickname change":
                if(!message.member.roles.exists("name",item.role)){
                    user.money += -itemPrice;
                    message.member.roles.add([message.guild.roles.find("name", item.role)],"Purchase from the shop");
                    message.author.send('**You bought ' + itemName + '!**');
                    message.guild.channels.find("name",item.channel).send(`<@${message.author.id}>`).then(m=>m.delete({"reason":"New channel ping"}))
                    await db.run(`UPDATE exp SET money =${user.money} WHERE id = ${message.author.id}`);
                }else{
                    message.author.send('**You already have a ' + itemName + ' active!**')
                }
                break;

            case "background":
                var proposal = await message.author.send("Write the code of the desired background (You can see them here https://www.fandomcircle.com/shop-1#PROFILES)")
                var filter = m => m.author.id == message.author.id;
                proposal.channel.awaitMessages(filter, { max: 1 })
                .then(collected => {
                    var m = collected.first();
                    var unavailable = client.data.unavailable.bgs;
                    var number = m.content.split(" ")[0].toUpperCase();

                    glob('../akira/images/backgrounds/**/*', async (err,fileArray) => {
                        var files = {};
                        fileArray.forEach(function(i){                                        
                            var splitFile = i.split("/")
                            files[splitFile[splitFile.length - 1].split(".")[0]] = parseInt(splitFile[splitFile.length - 2]);
                        }) 

                        if(files[number] == undefined) return m.author.send(`The background code ${number} doesnt exist or is no longer available for purchase. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                        if(unavailable.includes(number)) return m.author.send(`The background code ${number} is no longer available for purchase. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                        if(client.data.inventory[m.author.id].bgs.includes(number)) return m.author.send("You already have this background. Set it using >background <code>")                                                    
                        if(user.money < files[number]) return m.author.send("You cant afford this background");

                        user.money += -files[number];
                        client.data.inventory[m.author.id].bgs.push(number);
                                            
                        var msg = await message.author.send("Updating your profile (0/2)")
                        await db.run(`UPDATE exp SET money =${user.money} WHERE id = ${message.author.id}`);
                        msg.edit("Updating your profile (1/2)");
                        await util.save(client.data.inventory,"inventory")
                        msg.edit("Thanks for buying this background ^.^. Set it using >background <code>");
                    })
                })                                                                                          
                break;

            case "badges":
                message.author.send("Write the code of the desired badge (You can see them here https://www.fandomcircle.com/shop-1#PROFILES)").then(proposal => {
                    var filter = m => m.author.id == message.author.id;
                    proposal.channel.awaitMessages(filter, { max: 1 })
                    .then(async collected => {
                        var m = collected.first();
                        var unavailable = client.data.unavailable.badges;
                        var number = m.content.toUpperCase();

                        var fileArray = glob.sync('../akira/images/badges/**/*')
                        var files = {};
                        fileArray.forEach(function(i){
                            var splitFile = i.split("/")
                            files[splitFile[splitFile.length - 1].split(".")[0]] = parseInt(splitFile[splitFile.length - 2]);
                        }) 

                        if(files[number] == undefined) return m.author.send(`The badge ${number} doesnt exist or is no longer available for purchase. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                        if(unavailable.includes(number)) return m.author.send(`The badge ${number} is no longer available for purchase. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                        if(client.data.inventory[m.author.id].badges.includes(number)) return m.author.send("You already have this badge. Set it using >equip <position> <badge>")
                                                    
                        if(user.money < files[number]) return m.author.send("You cant afford this badge");

                        user.money += -files[number];
                        client.data.inventory[m.author.id].badges.push(number);

                        var msg = await message.author.send("Updating your profile (0/2)")
                        await db.run(`UPDATE exp SET money =${user.money} WHERE id = ${message.author.id}`);
                        await msg.edit("Updating your profile (1/2)");
                        await util.save(client.data.inventory,"inventory")
                        msg.edit("Thanks for buying this badge ^.^. Set it using >equip <badge> <position>");
                    })
                })
                break;
        }    
    }
}
