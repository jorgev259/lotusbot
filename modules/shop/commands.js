var path = require("path")
var util = require("../../utilities.js")
const moment = require('moment');
const fs = require('fs');
var glob = require('glob');
var colors = ["pink","d-blue","purple","l-blue","green","red"];
let {MessageEmbed} = require("discord.js");

module.exports = {
    commands: {
        addmoney: {
            desc:"This is a description",
            async execute(client, message, param, db){
                if (!param[1]) {
                    message.channel.send({embed: {
                        color: 10181046,
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL()
                        },

                        fields: [{
                            name: "Add Money",
                            value: `**You need to define an amount. Usage: >BALSET <amount> <user>**`
                        }]
                    }})
                    return;
                }

                if (isNaN(param[1])) {
                    message.channel.send({embed: {
                        color: 10181046,
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL()
                        },

                        fields: [{
                            name: "Add Money",
                            value: `**The amount has to be a number. Usage: >addmoney <amount> <user>**`
                        }]
                    }});
                    return;
                }
                var id = message.author.id;
                if(message.mentions.users.size > 0) id = message.mentions.users.first().id;
                await db.run(`UPDATE exp SET money = money + ${parseInt(param[1])} WHERE id = ${id}`);

                message.channel.send(`**User defined had ${param[1]} added/subtraction from their account.**`)
            }
        },

        daily:{
            desc:"This is a description",
            async execute(client, message, param, db){
                var userInfo = await db.get(`SELECT money,lastDaily FROM exp WHERE id = ${message.author.id}`);

                var embed = {
                    timestamp: message.createdTimestamp, 
                    author: {
                        name: message.author.displayName,
                        icon_url: message.author.displayAvatarURL(),               
                    },
                    footer:{

                    }
                }

                if(userInfo.lastDaily == "Not Collected" || moment.duration(moment().diff(moment(userInfo.lastDaily,"YYYY-MM-DD kk:mm"))).asHours() >= 24){
                    userInfo.money += 2000
                    await db.run(`UPDATE exp SET money = ${userInfo.money} WHERE id = ${message.author.id}`);
                    await db.run(`UPDATE exp SET lastDaily = "${moment().format("YYYY-MM-DD kk:mm")}" WHERE id = ${message.author.id}`);
                    
                    embed.fields= [{
                        name: "Daily collection",
                        value: `**You got 💴 2000! New Balance:** ${userInfo.money}`
                    }]
                    embed.color= 3446302
                    embed.footer.icon_url= "https://i.imgur.com/OWk7t7b.png"
                }else{ 
                    embed.footer.icon_url= "https://i.imgur.com/6zXSNu5.png"
                    embed.color= 0                                                              
                    embed.title= `**You already collected your daily reward! Collect your next reward** in ${24 - Math.floor(moment.duration(moment().diff(moment(userInfo.lastDaily,"YYYY-MM-DD kk:mm"))).asHours())} hours.`;                     
                }

                return message.channel.send({embed:embed})
            }
        },

        inventory: {
            desc:"Displays your bought items",
            async execute(client, message, param, db){
                var inventoryEmbed = new MessageEmbed();
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
                        bgs += `**${element}**\n`
                    }else{
                        bgs += `${element}\n`
                    }
                });
                if(bgsArray.length>0) inventoryEmbed.addField("Backgrounds",bgs);
                    
                var badges = "";
                let invArray = (await db.all(`SELECT item from inventory WHERE id=${message.author.id} AND type="badges"`)).map(e=>e.item);
                let badgesArray = (await db.all(`SELECT item from badges WHERE id=${message.author.id}`)).map(e=>e.item);
                invArray.forEach(element => {
                    if(badgesArray.includes(element)){
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
        },

        shop:{
            desc:"This is a description",
            alias:["buy"],
            async execute(client, message, param, db){
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
                        var proposal = await message.author.send("Write the name of the desired pack (You can see them here https://fandomcircle.com/shop")
                        var filter = m => m.author.id == message.author.id;
                        proposal.channel.awaitMessages(filter, { max: 1 })
                        .then(async collected => {
                            var m = collected.first();
                            if(!client.data.items["embed pack"].packs.hasOwnProperty(m.content.toLowerCase())) return m.channel.send(`Couldnt find the pack ${m.content}`);

                            var item = client.data.items["embed pack"].packs[m.content.toLowerCase()];                               
                            if(user.money < item.price) return m.author.send("You cant afford this embed pack");

                            if(message.member.roles.exists("name",item.role)) m.author.send('**You already have this embed pack!**');
                                
                            await db.run(`UPDATE exp SET money = money - ${item.price} WHERE id = ${message.author.id}`);
                            message.member.roles.add(message.guild.roles.find("name", item.role));
                            m.author.send('**You bought ' + itemName + '!**');
                            //message.guild.channels.find("name",item.channel).send(`<@${message.author.id}>`).then(m=>m.delete({"reason":"New channel ping"}))
                        })                              
                        break;

                    case "nickname change":
                        if(message.member.roles.exists("name",item.role)) message.author.send('**You already have a ' + itemName + ' active!**');
                            await message.member.roles.add([message.guild.roles.find("name", item.role)],"Purchase from the shop");
                            await db.run(`UPDATE exp SET money = money - ${itemPrice} WHERE id = ${message.author.id}`);
                            await message.author.send('**You bought ' + itemName + '!**');
                            message.guild.channels.find("name",item.channel).send(`<@${message.author.id}>`).then(m=>m.delete({"reason":"New channel ping"}))                   
                        break;

                    case "background":
                        var proposal = await message.author.send("Write the code of the desired background (You can see them here https://fandomcircle.com/backgrounds)")
                        var filter = m => m.author.id == message.author.id;
                        proposal.channel.awaitMessages(filter, { max: 1 })
                        .then(async collected => {
                            var m = collected.first();
                            var unavailable = client.data.unavailable.bgs;
                            var number = m.content.split(" ")[0].toUpperCase();

                            var fileArray = glob.sync("images/backgrounds/**/*");
                            var files = {};
                            fileArray.forEach(function(i){                                        
                                var splitFile = i.split("/")
                                files[splitFile[splitFile.length - 1].split(".")[0]] = parseInt(splitFile[splitFile.length - 2]);
                            }) 

                            if(files[number] == undefined) return m.author.send(`The background code ${number} doesnt exist or is no longer available for purchase. Check https://fandomcircle.com/backgrounds for more info`)
                            if(unavailable.includes(number)) return m.author.send(`The background code ${number} is no longer available for purchase. Check https://fandomcircle.com/backgrounds for more info`)
                            
                            let bgs = (await db.all(`SELECT item from inventory WHERE id=${message.author.id} AND type="bgs"`)).map(e=>e.item);
                            if(bgs.includes(number)) return m.author.send("You already have this background. Set it using >background <code>")                                                    
                            if(user.money < files[number]) return m.author.send("You cant afford this background");

                            await db.run("INSERT INTO inventory (id,type,item) VALUES (?,?,?)", [message.author.id, "bgs", number])
                            await db.run(`UPDATE exp SET money = money - ${files[number]} WHERE id = ${message.author.id}`);
                            m.author.send("Thanks for buying this background ^.^. Set it using >background <code>");
                        })                                                                                          
                        break;

                    case "badges":
                        message.author.send("Write the code of the desired badge (You can see them here https://fandomcircle.com/badges)").then(proposal => {
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
                                
                                let badges = (await db.all(`SELECT item from inventory WHERE id=${message.author.id} AND type="badges"`)).map(e=>e.item);

                                if(files[number] == undefined) return m.author.send(`The badge ${number} doesnt exist or is no longer available for purchase. Check https://fandomcircle.com/badges for more info`)
                                if(unavailable.includes(number)) return m.author.send(`The badge ${number} is no longer available for purchase. Check https://fandomcircle.com/badges for more info`)
                                if(badges.includes(number)) return m.author.send("You already have this badge. Set it using >equip <position> <badge>")
                                                            
                                if(user.money < files[number]) return m.author.send("You cant afford this badge");

                                await db.run("INSERT INTO inventory (id,type,item) VALUES (?,?,?)", [message.author.id, "badges", number]);
                                await db.run(`UPDATE exp SET money = money - ${files[number]} WHERE id = ${message.author.id}`);

                                m.author.send("Thanks for buying this badge ^.^. Set it using >equip <badge> <position>");
                            })
                        })
                        break;

                    case "color change":
                        //var colors = ["pink","d-blue","purple","l-blue","green","red"];
                        message.author.send("Please Wait...").then(async proposal => {
                            const reacts = [(await proposal.react(client.emojis.find("name","pink"))).emoji.id, 
                                            (await proposal.react(client.emojis.find("name","darkblue"))).emoji.id, 
                                            (await proposal.react(client.emojis.find("name","purple"))).emoji.id, 
                                            (await proposal.react(client.emojis.find("name","lightblue"))).emoji.id,  
                                            (await proposal.react(client.emojis.find("name","green"))).emoji.id, 
                                            (await proposal.react(client.emojis.find("name","red"))).emoji.id];
                            
                            await proposal.edit("React with the desired color");
                            const filter = (reaction, user) => user.id === message.author.id;
                            const collector = proposal.createReactionCollector(filter, {max:1});
                            
                            collector.on('collect', async (reaction, user) => {
                                let newColor = colors[reacts.indexOf(reaction.emoji.id)]
                                const { rank, color } = await db.get(`SELECT rank,color FROM exp WHERE id = ${user.id}`);

                                await message.member.roles.remove([client.data.colorRoles[color][rank], client.data.groupRoles[color]]);
                                await message.member.roles.add([client.data.colorRoles[newColor][rank], client.data.groupRoles[newColor]]);
                                await db.run(`UPDATE exp SET color = "${newColor}", money = money - ${itemPrice} WHERE id = ${user.id}`);
                                await proposal.channel.send("Color change successful!");
                                proposal.delete();                
                            });                    
                        })
                        break;
                }    
            }
        }
    }
}