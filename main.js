var dotenv = require('dotenv');
var validUrl = require('valid-url');
dotenv.load();

const Discord = require('discord.js');
var fs = require("fs");
const client = new Discord.Client();
var util = require('./utilities.js');
var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());


var db = require('mongojs')(process.env.mongourl);
var config;
db.collection('config').find({},function(err,result){
    config = result[0]
});
var commands = db.collection('commands');
var perms = db.collection('perms');
var quotes = db.collection('quotes');

var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];

var router = express.Router();
router.get('/embed', function(req, res) {
   commands.find({"type":"embed"},function(err,result){
       var response = [];
        result.forEach(function(embed){
            if(typeof embed.content === 'string'){
                response.push(embed.content);
            }else{
                embed.content.forEach(function(embed2){
                    response.push(embed2);
                })
            }
        })
        res.send(response);
    })
});

app.use(router);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.listen((process.env.OPENSHIFT_NODEJS_PORT||8080), process.env.OPENSHIFT_NODEJS_IP, function() {console.log(process.env.OPENSHIFT_NODEJS_IP + ":" + process.env.OPENSHIFT_NODEJS_PORT)});


client.on('ready', () => {
    console.log('I am ready!');
});

client.on("guildMemberAdd", (member) => {
    member.guild.channels.find("name","general").send("Welcome to Fandom Circle, <@" + member.id + ">! Have Fun");
    member.addRole(member.guild.roles.find("name", "Nation"));
});

client.on('message', message => {
    var prefix = config.prefix;
    if(message.content.startsWith(prefix)){
        var param = message.content.split(" ");
        param[0] = param[0].split(prefix)[1];

        util.checkalias(param[0].toLowerCase(), commands,function(err,command){
            perms.find({"name":command.name},function(err,result){
                if(result.length>0){
                    var allowed = false;
                    for(var i=0;i<result[0].perms.length;i++){
                        var role = message.member.guild.roles.find("name", result[0].perms[i]);
                            if(role != null && message.member.roles.has(role.id)){
                            allowed = true;
                            i=result[0].perms.length;
                        }
                    }
                        if(!allowed){
                        command.type = "not allowed";
                    }
                }
                if(command.type == "execute"){command.type = param[0]};
                switch(command.type){
                    case "not allowed":
                        message.reply("you are not allowed to use this command");
                        break;

                    case "simple":
                        message.delete();
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
                        var embed = new Discord.RichEmbed()
                        .setColor(0x7C00B9)
                        .setImage(command.content[0]);
                         message.channel.send({embed});
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
                        perms.find({"name":param[1]},function(err,result){
                            if(result.length > 0){
                                var type = param[2];
                                var name = param[1];
                                param.shift();
                                param.shift();
                                param.shift();
                                switch(type){
                                    case "add":
                                        result[0].perms.push(param.join(" "));
                                        perms.save(result[0]);
                                        message.reply("Added " + param.join(" ") + " to the command " + name);
                                        break;

                                    case "remove":
                                        result[0].perms = result[0].perms.filter(e => e !== param.join(" ") );
                                        perms.save(result[0]);
                                        message.reply("Removed " + param.join(" ") + " from the command " + name);
                                        break;
                                }
                            }else{
                                var type = param[2];
                                var name = param[1];
                                param.shift();
                                param.shift();
                                param.shift();
                                switch(type){
                                    case "add":
                                        perms.save({"name":name,"perms":[param.join(" ")]});
                                        message.reply("Added " + param.join(" ") + " to the command " + name);
                                        break;
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
                            message.channel.fetchMessage(snowflake).then(function(quote){
                            quotes.count(function(err,count){
                                var embed = new Discord.RichEmbed()
                                .setColor(color)
                                .setDescription(quote.content + "\nQuote id: " + count)
                                .setTitle("#" + quote.channel.name)
                                .setThumbnail(thumb)
                                .setAuthor(quote.author.username, quote.author.avatarURL);
                                    quotes.save({
                                    "id":count,
                                    "desc":quote.content,
                                    "title":"#" + quote.channel.name,
                                    "author":quote.author.username,
                                    "thumb":thumb,
                                    "color":color,
                                    "avatar": quote.author.avatarURL
                                });
                                    message.guild.channels.find("name","featured-quotes").send({embed});
                                message.delete();
                                message.reply(" has recorded your message in the books of history <@" + quote.author.id + ">");
                            });
                        });
                        break;

                    case "quote":
                        quotes.find({"id":parseInt(param[1])},function(err,result){
                            if(result.length>0){
                                var quote = result[0];
                                    var embed = new Discord.RichEmbed()
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
        }else{
            switch(message.channel.name){
                case "rate-music":
                    if(validUrl.isUri(message.content)){
                        var star = message.guild.emojis.find("name","r1");
                        message.channel.send("Rating 1 out of 10 " + star.toString() + ". Shared by " + message.author.toString() + "\n" + message.content).then(reply => {
                            reactionNumbers.forEach(function(reaction){
                                reply.react(reaction);
                            });
                            var collector = reply.createReactionCollector((reaction, user) => user.id != client.user.id);
                            collector.on('collect',reaction => {
                                reaction.message.reactions.forEach(function(react){
                                    if(react.users.exists("id",reactions)){}
                                })
                            });
                        });
                        message.delete();
                    }
                    break;
            }
    }
});
client.login(process.env.discord_token);
