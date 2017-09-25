var dotenv = require('dotenv');
var validUrl = require('valid-url');
dotenv.load();

const Discord = require('discord.js');
var fs = require("fs");
const client = new Discord.Client();

var util = require('./utilities.js');
var restAPI = require('./web.js')();
//var music = require('./music.js');

var db = require('mongojs')(process.env.mongourl);
var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];

var commands = db.collection('commands');
var perms = db.collection('perms');
var quotes = db.collection('quotes');
var art = db.collection('art-ids')

var config;

function role(number,guild){
    var channel = guild.channels.find("name","level-" + number);
    var rolerole = guild.roles.find("name","[" + number + "] Level");
    channel.permissionsFor(guild.id,{SEND_MESSAGES: false,READ_MESSAGES:false});
    channel.permissionsFor(rolerole.id,{SEND_MESSAGES: true,READ_MESSAGES:true});

    if(number<40){
        role(number + 1,guild)
    }
}

client.on('ready', () => {
    console.log('I am ready!');
    db.collection('config').find({},function(err,result){
        config = result[0];
        //music.set(client,config.autolist.split("playlist?list=")[1]);
    });

   var guild = client.guilds.find("id","289758148175200257");
    role(1,guild);
});

client.on("guildMemberAdd", (member) => {
    member.guild.channels.find("name","main-lounge").send("Welcome to Fandom Circle, <@" + member.id + ">! Have Fun");
     member.addRoles([member.guild.roles.find("name", "Customers"),member.guild.roles.find("name","[1] Level")]);
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
    console.log(user.username);
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
    const command = message.content.substring(prefix.length).split(/[ \n]/)[0].toLowerCase().trim();
    const suffix = message.content.substring(prefix.length + command.length).trim();

    if(message.content.startsWith(prefix)){
        try{
            var param = message.content.split(" ");
            param[0] = param[0].split(prefix)[1];

            util.checkalias(param[0].toLowerCase(), commands,function(err,command){
                perms.find({"name":command.name},function(err,result){
                    if(result.length>0){
                        var allowedChannel = true;
                        var allowed = false;

                        if(result[0].channel.length>0){
                            allowedChannel = false;
                            result[0].channel.forEach(function(channel){
                                if(channel == message.channel.name){allowedChannel = true;allowed=true;}
                            })
                        }
                        if(allowedChannel){
                            if(result[0].role.length>0 || result[0].user.length>0){allowed = false};

                            if(result[0].role.length>0){
                                for(var i=0;i<result[0].role.length;i++){
                                    var role = message.member.guild.roles.find("name", result[0].role[i]);
                                    if(role != null && message.member.roles.has(role.id)){
                                        allowed = true;
                                        i=result[0].role.length;
                                    }
                                }
                            }
                            if(!allowed && result[0].user.length>0){
                                for(var i=0;i<result[0].user.length;i++){
                                    if(result[0].user[i] == message.author.id){
                                        allowed = true;
                                        i=result[0].user.length;
                                    }
                                }
                            }

                        }

                        if(!allowed){
                            command.type = "simple";
                            command.content = "You are not allowed to use this command";
                        }
                    }
                    if(command.type == "execute"){command.type = param[0]};
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
                                    commands.save(command);
                            }
                            break;

                        case "add":
                            var name = param[2].toLowerCase();
                            var type = param[1].toLowerCase();
                            param.shift();
                            param.shift();
                            param.shift();
                            commands.find({"name":name},function(err,result){
                                if(type === "embed" && result.length>0){
                                    result[0].content.push(param.join(" "));
                                    commands.save(result[0]);
                                    message.reply("Command udpated");
                                }else if(result.length==0){
                                    var output;
                                    if(type === "embed"){
                                        content = [param.join(" ").split("\\n").join("\n")];
                                    }else{
                                        content = param.join(" ").split("\\n").join("\n");
                                    }

                                    commands.save({
                                        "name":name,
                                        "type":type,
                                        "content": content,
                                        "perms":[]
                                    });
                                    message.reply("Command added");
                                }else{
                                    message.reply("That command already exists, choose another name");
                                }
                            });
                            break;

                        case "show":
                            commands.find({"type":param[1]},function(err,result){
                                if(result.length>0){
                                    var final = "```" + result[0].name;
                                    for(var i=1;i<result.length;i++){
                                        final += ", " + result[i].name;
                                    };
                                    message.reply(final + "```");
                                }else{
                                    message.reply("no matching results");
                                }
                            });
                            break;


                        case "remove":
                            commands.find({"name":param[1].toLowerCase()},function(err,result){
                                if(result.length>0 && result[0].type !== "execute"){
                                    var query = {"name":param[1]};
                                    commands.remove(query);
                                    message.reply("Command removed");
                                }else if(result.length>0 && result[0].type === "execute"){
                                    message.reply("Command cant be removed, contact a Staff member");
                                }else{
                                    message.reply("Command doesnt exist");
                                }
                            });
                            break;

                        case "perms":
                            var name = param[1];
                            var type = param[2];
                            param.shift();
                            param.shift();
                            param.shift();

                            perms.find({"name":name},function(err,result){
                                if(result.length > 0){
                                    switch(type){
                                        case "add":
                                            if((Array.from(message.mentions.users.values())).length > 0){
                                                result[0].user.push((Array.from(message.mentions.users.values()))[0].id);
                                            }else if((Array.from(message.mentions.channels.values())).length > 0){
                                                 result[0].channel.push((Array.from(message.mentions.channels.values()))[0].id);
                                            }else{
                                                result[0].role.push(param.join(" "));
                                            }
                                            perms.save(result[0]);
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
                                            var newPerm = {"name":name, "user":[], "role":[], "channel":[]};

                                            if((Array.from(message.mentions.users.values())).length > 0){
                                                newPerm.user.push((Array.from(message.mentions.users.values()))[0].id);
                                            }else if((Array.from(message.mentions.channels.values())).length > 0){
                                                 newPerm.channel.push((Array.from(message.mentions.channels.values()))[0].id);
                                            }else{
                                                newPerm.role.push(param.join(" "));
                                            }

                                            perms.save(newPerm);
                                            message.reply(param.join(" ") + " is now allowed to use " + name);
                                            break;

                                        case "delete":
                                            message.reply("This command has no permissions set");
                                    }
                                }
                            });
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
                                quotes.count(function(err,count){
                                    var embed = new Discord.MessageEmbed()
                                    .setColor(color)
                                    .setDescription(quote.content + "\nQuote id: " + count)
                                    .setTitle("#" + quote.channel.name)
                                    .setThumbnail(thumb)
                                    .setAuthor(quote.author.username, quote.author.displayAvatarURL());
                                        quotes.save({
                                        "id":count,
                                        "desc":quote.content,
                                        "title":"#" + quote.channel.name,
                                        "author":quote.author.username,
                                        "thumb":thumb,
                                        "color":color,
                                        "avatar": quote.author.defaultAvatarURL
                                    });
                                    message.guild.channels.find("name","memorabilia").send({embed});
                                    message.delete();
                                    message.reply(" has recorded your message in the books of history <@" + quote.author.id + ">");
                                });
                            });
                            break;

                        case "quote":
                            quotes.find({"id":parseInt(param[1])},function(err,result){
                                if(result.length>0){
                                    var quote = result[0];
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
                            })
                            break;

                        case "set":
                            config[param[1]] = param[2];
                            db.collection("config").save(config);
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

                        /*case 'play':
                            music.add(message);
                            break;

                        case 'skip':
                             music.skip(message);
                            break;

                        case 'queue':
                             music.queue(message);
                            break

                        /*case 'pause':
                             music.pause(message, suffix, client);
                            break;

                        case 'resume':
                             music.resume(message, suffix, client);
                            break;

                        case 'volume':
                             music.volume(message, suffix, client);
                            break;

                        case 'join':
                             music.join(message);
                            break;

                        case 'clearqueue':
                             music.clearqueue(message, suffix, client);
                            break;*/

                        case "prune":
                            message.channel.bulkDelete(parseInt(param[1]));
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

                        case "default":
                        default:
                            if(config["404"] === "true"){
                                setTimeout(function(){message.delete()},parseInt(config.deleteTimeout));
                                message.reply('This command is not on our realm').then(reply =>  setTimeout(function(){reply.delete()},parseInt(config.deleteTimeout)));
                            }
                            break;
                        }
                    })
                })
            }catch(e){

            }
        }else{
            switch(message.channel.name){
                case "art":
                    if(message.attachments.size > 0){
                        util.react(0,10,message);
                        art.save({"id":message.id,"score":0,"author":message.author.id});
                    }
                    break;
            }
    }
});
client.login(process.env.discord_token);
