var validUrl = require('valid-url');

const Discord = require('discord.js');
var fs = require("fs");
const client = new Discord.Client();

var util = require('./utilities.js');
//var music = require('./music.js');

var reactions = ["rage","thinking","blush","stuck_out_tongue_closed_eyes","heart_eyes"];

var commands = require("../data/commands.json");
var perms = require("../data/perms.json");
//var quotes = require("../data/quotes.json");
//var art= require("../data/art.json");
var config = require("../data/config.json");

client.on('ready', () => {
    console.log('I am ready!');
});

client.on("guildMemberAdd", (member) => {
    member.guild.channels.find("name","main-lounge").send("Welcome to Fandom Circle, <@" + member.id + ">! Have Fun");
    member.addRoles([member.guild.roles.find("name", "Customers"),member.guild.roles.find("name","[1]")]);
});

client.on("messageReactionAdd",(reaction,user)=>{
    if(user.id != client.user.id && reaction.message.channel.name == "art"){
        art.find({"id":reaction.message.id},function(err,result){
            if(result.length>0){
                util.checkReact(reaction,user,result[0])
            }
        })
    }
});

client.on("messageReactionRemove",(reaction,user)=>{
    if(reaction.message.channel.name == "art"){
        var count =  util.emojiCount(reaction,user);
        if(count == 0){
            art.find({"id":reaction.message.id},function(err,result){
                if(result.length>0){
                    result[0].score = result[0].score - util.findEmoji(reaction.emoji.name);
                    art.save(result[0]);
                }
            })
        }
    }
})

client.on('message', message => {
    var prefix = config.prefix;

    if(message.content.startsWith(prefix)){
        const commandName = message.content.substring(prefix.length).split(/[ \n]/)[0].toLowerCase().trim();
        const suffix = message.content.substring(prefix.length + commandName.length).trim();
        var command = commands[commandName];

        var param = message.content.split(" ");
        param[0] = param[0].split(prefix)[1];

        if(perms[commandName] != undefined){
            var allowedChannel = true;
            var allowed = false;

            if(perms[commandName].channel.length>0){
                allowedChannel = false;
                perms[commandName].channel.forEach(function(channel){
                    if(channel == message.channel.name){allowedChannel = true;allowed=true;}
                })
            }
            if(allowedChannel){
                if(perms[commandName].role.length>0 || perms[commandName].user.length>0){allowed = false};

                if(perms[commandName].role.length>0){
                    for(var i=0;i<perms[commandName].role.length;i++){
                        var role = message.member.guild.roles.find("name", perms[commandName].role[i]);
                        if(role != null && message.member.roles.has(role.id)){
                            allowed = true;
                            i=perms[commandName].role.length;
                        }
                    }
                }
                if(!allowed && perms[commandName].user.length>0){
                    for(var i=0;i<perms[commandName].user.length;i++){
                        if(perms[commandName].user[i] == message.author.id){
                            allowed = true;
                            i=perms[commandName].user.length;
                        }
                    }
                }

            }

            if(!allowed){
                command.type = "simple";
                command.content = "You are not allowed to use this command";
            }
        }
        if(command == undefined){command = {}; command.type = param[0]};
        switch(command.type){
            case "simple":
                message.channel.send(command.content);
                break;

            case "say":
                message.mentions.channels.forEach(function(channel){
                    param.shift();
                    param.shift();
                    channel.send((param.join(" ")).split("\\n").join("\n"));
                });
                break

                case "embed":
                message.channel.send("",{files: [command.content[0]]});
                if(command.content.length>1){
                    var first = command.content[0];
                    for(var i=1;i<command.content.length;i++){
                        command.content[i-1] = command.content[i];
                    };
                    command.content[command.content.length - 1] = first;
                    commands[commandName] = command;
                    util.save(commands,"commands");
                }
                break;

            case "add":
                var name = param[2].toLowerCase();
                var type = param[1].toLowerCase();
                param.shift();
                param.shift();
                param.shift();
                if(commands[name] != undefined && type === "embed"){
                    commands[name].content.push(param.join(" "));
                    util.save(commands,"commands");
                    message.reply("Command udpated");
                }else if(commands[name] == undefined){
                    if(type === "embed"){
                        content = [param.join(" ").split("\\n").join("\n")];
                    }else{
                        content = param.join(" ").split("\\n").join("\n");
                    }

                    commands[name] = {
                        "type":type,
                        "content": content,
                        "perms":[]
                    };

                    util.save(commands,"commands");
                    message.reply("Command added");
                }else{
                    message.reply("That command already exists, choose another name");
                }
                break;

            case "show":
                var commandList = Object.keys(commands).filter(function(key){
                    return commands[key].type == param[1];
                })
                if(commandList.length>0){
                    var final = "```" + commands[commandList[0]].name;
                    for(var i=1;i<commandList.length;i++){
                        final += ", " + commands[commandList[i]].name;
                    };
                    message.reply(final + "```");
                }else{
                    message.reply("no matching results");
                }
                break;


            case "remove":
                var exCommand = commands[param[1].toLowerCase()];
                if(exCommand != undefined){
                    delete commands[param[1].toLowerCase()];
                    util.save(commands,"commands");
                    message.reply("Command removed");
                }else{
                    message.reply("Command doesnt exist");
                }
                break;

            case "perms":
                var name = param[1];
                var type = param[2];
                param.shift();
                param.shift();
                param.shift();
                if(perm != undefined){
                    switch(type){
                        case "add":
                            if((Array.from(message.mentions.users.values())).length > 0){
                                perms[name].user.push((Array.from(message.mentions.users.values()))[0].id);
                            }else if((Array.from(message.mentions.channels.values())).length > 0){
                                perms[name].channel.push((Array.from(message.mentions.channels.values()))[0].id);
                            }else{
                                perms[name].role.push(param.join(" "));
                            }
                            util.save(perms,"perms");
                            message.reply(param.join(" ") + " is now allowed to use " + name);
                            break;

                            /*case "remove":
                                            result[0].perms = result[0].perms.filter(e => e !== param.join(" ") );
                                            perms.save(result[0]);
                                            message.reply("Removed " + param.join(" ") + " from the command " + name);
                                            break;*/
                    }
                }else{
                    switch(type){
                        case "add":
                            perms[name] = {"user":[], "role":[], "channel":[]};

                            if((Array.from(message.mentions.users.values())).length > 0){
                                perms[name].user.push((Array.from(message.mentions.users.values()))[0].id);
                            }else if((Array.from(message.mentions.channels.values())).length > 0){
                                perms[name].channel.push((Array.from(message.mentions.channels.values()))[0].id);
                            }else{
                                perms[name].role.push(param.join(" "));
                            }

                            util.save(perms,"perms");
                            message.reply(param.join(" ") + " is now allowed to use " + name);
                            break;

                        case "delete":
                            message.reply("This command has no permissions set");
                    }
                }
                break;

            case "addquote":
                var color;
                var thumb;
                var snowflake;
                if(param.length == 3 && param[1].toLowerCase() === "deep"){
                    color = 0x08457E;
                    thumb = "https://raw.githubusercontent.com/rikumax25/akirabot/master/resources/74625-32.png";
                    snowflake = param[2];
                }else{
                    color = 0x7C00B9;
                    thumb = "https://gamefaqs.akamaized.net/faqs/25/74625-32.png";
                    snowflake = param[1];
                }
                message.channel.messages.fetch(snowflake).then(function(quote){
                    var embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setDescription(quote.content + "\nQuote id: " + Object.keys(quotes).length)
                    .setTitle("#" + quote.channel.name)
                    .setThumbnail(thumb)
                    .setAuthor(quote.author.username, quote.author.displayAvatarURL());
                    quotes[Object.keys(quotes).length] = {
                        "desc":quote.content,
                        "title":"#" + quote.channel.name,
                        "author":quote.author.username,
                        "thumb":thumb,
                        "color":color,
                        "avatar": quote.author.defaultAvatarURL
                    };
                    //save line
                    message.guild.channels.find("name","memorabilia").send({embed});
                    message.delete();
                    message.reply(" has recorded your message in the books of history <@" + quote.author.id + ">");
                });
                break;

            case "quote":
                var quote = quotes[parseInt(param[1])];
                if(quote != undefined){
                    var embed = new Discord.MessageEmbed()
                    .setColor(quote.color)
                    .setDescription(quote.desc)
                    .setTitle(quote.title)
                    .setThumbnail(quote.thumb)
                    .setAuthor(quote.author, quote.avatar);
                    message.channel.send({embed});
                }else{
                    message.reply("invalid Quote id");
                }
                break;

            case "set":
                config[param[1]] = param[2];
                //save line
                message.reply("Set " + param[1] + " as " + param[2]);
                break;

            case "role":
                param.splice(0,(Array.from(message.mentions.users.values())).length + 1);
                var roles = param.join(" ").split("|");
                message.mentions.users.forEach(function(user){
                    var member = message.guild.member(user);
                    var roleList = [];

                    roles.forEach(function(rolename){
                        var role = message.guild.roles.find("name",rolename);
                        if(role === null){
                            message.reply("Couldnt find role " + rolename);
                        }else{
                            roleList.push(role);
                        }
                    })
                    if(roleList.length > 0){
                        member.setRoles(roleList);
                    }
                })
                message.reply("Roles completed!");
                break;

            case "poll":
                message.delete();
                var optionMessage;
                message.reply("type the options for you poll. Example: `option 1|Option 2|Non numbered option`").then(mDelete => optionMessage = mDelete);
                const collector = message.channel.createMessageCollector(
                    m => m.author.id == message.author.id,
                    { max: 1 }
                );
                collector.on('collect', m => {
                    m.delete();
                    optionMessage.delete();
                    var time = parseInt(param[1]);
                    param.shift();
                    param.shift();
                    var text = param.join(" ") + ": ";
                    var count = 0;
                    var options = m.content.split("|");
                    options.forEach(function(option){
                        text += (count+1) + ") `"  + option + "`:white_small_square:";
                        count++;
                    })
                    message.channel.send(text).then(poll => {
                        util.react(0,count,poll);
                        message.channel.send("Poll will be over in "  + time + " minutes").then(pollTime => {
                            setTimeout(function(){
                                pollTime.delete();
                                var results = []
                                poll.reactions.array().forEach(function(reaction){
                                    results.push({"name":options[(parseInt(reaction._emoji.name.charAt(0)))-1],"points":parseInt(reaction.count)});
                                })

                                results.sort(function(a,b){
                                    return a.points - b.points
                                })

                                var winners = [results[results.length-1]];
                                for(var i=results.length-2;i>=0;i--){
                                    if(results[i].points == results[i+1].points){
                                        winners.push(results[i]);
                                    }else{
                                        i=-1;
                                    }
                                }

                                if(winners.length == 1){
                                    message.channel.send("Poll has finished. *drumrolls*\n" + param.join(" ") + " " + winners[0].name+ "!");
                                }else{
                                    var response = "Poll has finished. " + param.join(" ") + "\n*drumrolls*\nThere was a tie between " + winners[0].name;
                                    for(var i=1;i<winners.length;i++){
                                        if(i+1 == winners.length){
                                            response += " and " + winners[i].name;
                                        }else{
                                            response += ", " + winners[i].name;
                                        }
                                    }
                                    message.channel.send(response);
                                }
                            },time*60000)
                        });
                    });
                });
                break;

            case "prune":
                message.channel.bulkDelete(parseInt(param[1]) + 1);
                break;

            case "mute":
                if (message.mentions.members.size>0){
                    message.mentions.members.map(member => {
                        member.addRole(member.guild.roles.find("name","Muted"))
                        member.send("You got muted, appeal to a Staff member if you want to be unmuted");
                    })
                }else{
                    message.reply(" you forgot to mention the users......")
                }
                break;

            case "unmute":
                message.mentions.members.map(member => {
                    member.removeRole(member.guild.roles.find("name","Muted"))
                })
                break;

            case "eval":
                try {
                    param.shift();
                    const code = param.join(" ");
                    let evaled = eval(code);

                    if (typeof evaled !== "string")
                        evaled = require("util").inspect(evaled);

                    if (typeof(evaled) === "string")
                        evaled = evaled.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

                    message.channel.send(evaled, {code:"xl"});
                } catch (err) {
                    message.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
                }

                break;
        }
    }else{
        switch(message.channel.name){
            case "creations":
                /*if(message.attachments.size > 0){
                        art.save({"id":message.id,"score":0,"author":message.author.id});
                    }*/
                if(!(message.attachments.size > 0 || message.embeds.length>0)){
                    message.delete();
                    message.author.send("#creations is used to post your original creations, discuss or comment about the on #art. If your work is being deleted please contact a staff member");
                }else{
                    util.react(0,5,message);
                }
                break;
        }
    }
});

client.login(config.token);
