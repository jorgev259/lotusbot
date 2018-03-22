const Discord = require('discord.js');
var path = require("path")
var util = require("../../utilities.js")
const fs = require('fs');
var glob = require('glob')

module.exports = {
    desc:"This is a description",
    alias:["buy"],
    async execute(client, message, param){
            util.userCheck(message.author.id,client);
            let items = client.data.items;

            let categories = [];
            if (!param.join(" ")) {
                for (var i in items) {
                    if (!categories.includes(items[i].type)) {
                        categories.push(items[i].type)
                    }
                }
                // I deleted something in this section that was giving me bunch of error but after deleting one still stayd pls look at the original
                const embed = new Discord.MessageEmbed()
                .setDescription(`Available Items`)
                .setColor(0xD4AF37)

                for (var i = 0; i < categories.length; i++) {
                    var tempDesc = '';
                    for (var c in items) {
                        if (categories[i] === items[c].type) {
                            tempDesc += `${items[c].name} - $${items[c].price} - ${items[c].desc}\n`;
                        }
                    }
                    embed.addField(categories[i], tempDesc);
                }
                return message.author.send(embed);
            }

            let itemName = '';
            let itemPrice = 0;
            let itemDesc = '';
            let item;
            if(param[0]){
                for (var i in items) {
                    if (param.slice(1).join(" ").trim().toLowerCase() === items[i].name.toLowerCase()) {
                        itemName = items[i].name;
                        itemPrice = items[i].price;
                        itemDesc = items[i].desc;
                        itemType = items[i].type;
                        item = items[i]
                    }
                }

                if (itemName === '') {
                    return message.author.send({embed: {
                        color: 0,
                        fields: [{
                            name: "Fandom Circle - Shop",
                            value: `**Item ${param.slice(1).join(" ").trim()} not found.**`
                        }]
                    }})
                }

                var user = client.data.exp[message.author.id];
                
                if (Number.isInteger(itemPrice) && user.money < itemPrice) {
                    return message.author.send({embed: {
                        color: 16727113,
                        fields: [{
                            name: "Fandom Circle - Shop",
                            value: `**You don't have enough money for this item.**`
                        }]
                    }});
                }

                switch(itemType){
                    case "Packs":
                        if(!message.member.roles.exists("name",item.role)){
                            client.data.exp[message.author.id].money += -itemPrice;
                            message.member.roles.add(message.guild.roles.find("name", item.role));
                            message.author.send('**You bought ' + itemName + '!**');
                            //message.guild.channels.find("name",item.channel).send(`<@${message.author.id}>`).then(m=>m.delete({"reason":"New channel ping"}))
                        }else{
                            message.author.send('**You already have ' + itemName + '!**')
                        }
                        break;

                    case "Utilities":
                        switch(itemName){
                            case "Nickname Change":
                                if(!message.member.roles.exists("name",item.role)){
                                    client.data.exp[message.author.id].money += -itemPrice;
                                    message.member.roles.add(message.guild.roles.find("name", item.role),"Purchase from the shop");
                                    message.author.send('**You bought ' + itemName + '!**');
                                    message.guild.channels.find("name",item.channel).send(`<@${message.author.id}>`).then(m=>m.delete({"reason":"New channel ping"}))
                                    util.save(client.data.exp,"exp");
                                }else{
                                    message.author.send('**You already have a ' + itemName + ' active!**')
                                }
                                break;

                            case "Background":
                                var proposal = await message.author.send("Write the code of the desired background (You can see them here https://www.fandomcircle.com/shop-1#PROFILES)")
                                var filter = m => m.author.id == message.author.id;
                                proposal.channel.awaitMessages(filter, { max: 1 })
                                .then(collected => {
                                    var m = collected.first();
                                    var unavailable = client.data.unavailable.bgs;
                                    var number = m.content.split(" ")[0].toUpperCase();

                                        glob('../akira/images/backgrounds/**/*', function(err,fileArray){
                                            var files = {};
                                            fileArray.forEach(function(i){                                        
                                                var splitFile = i.split("/")
                                                files[splitFile[splitFile.length - 1].split(".")[0]] = parseInt(splitFile[splitFile.length - 2]);
                                            }) 

                                            if(files[number] == undefined) return m.author.send(`The background code ${number} doesnt exist or is no longer available for purchase. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                                            if(unavailable.includes(number)) return m.author.send(`The background code ${number} is no longer available for purchase. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                                            if(client.data.inventory[m.author.id].bgs.includes(number)) return m.author.send("You already have this background. Set it using >background <code>")                                                    
                                            if(client.data.exp[m.author.id].money < files[number]) return m.author.send("You cant afford this background");

                                            client.data.exp[m.author.id].money += -files[number];
                                            client.data.inventory[m.author.id].bgs.push(number);
                                            
                                            message.author.send("Updating your profile (0/2)").then(msg => {
                                                util.save(client.data.exp,"exp").then(()=>{
                                                    msg.edit("Updating your profile (1/2)");
                                                    util.save(client.data.inventory,"inventory").then(()=>{
                                                        msg.edit("Thanks for buying this background ^.^. Set it using >background <code>");
                                                    })
                                                })  
                                            })                                                                                            
                                        });
                                    })
                                break;

                            case "Badges":
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
                                                    
                                        if(client.data.exp[m.author.id].money < files[number]) return m.author.send("You cant afford this badge");

                                        client.data.exp[m.author.id].money += -files[number];
                                        client.data.inventory[m.author.id].badges.push(number);

                                        var msg = await message.author.send("Updating your profile (0/2)")
                                        await util.save(client.data.exp,"exp")
                                        await msg.edit("Updating your profile (1/2)");
                                        await util.save(client.data.inventory,"inventory")
                                        msg.edit("Thanks for buying this badge ^.^. Set it using >equip <badge> <position>");
                                    })
                                })
                                break;
                        }
                        break;
                }
            }       
    }
}
