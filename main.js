var dotenv = require('dotenv');
dotenv.load();

const Discord = require('discord.js');
var fs = require("fs");
const client = new Discord.Client();
var util = require('./utilities.js');

var config =JSON.parse(fs.readFileSync('config.json', 'utf8'));
var prefix = config.prefix;

var mongojs = require('mongojs');
var db = mongojs(process.env.mongourl);
var commands = db.collection('commands');
var quotes = db.collection('quotes');

client.on('ready', () => {
    console.log('I am ready!');
});

client.on("guildMemberAdd", (member) => {
    member.guild.channels.find("name","general").send("Welcome to Fandom Circle, <@" + member.id + ">! Have Fun");
    member.addRole(member.guild.roles.find("name", "Nation"));
});

client.on('message', message => {
    if(message.content.startsWith(prefix)){
        var param = message.content.split(" ");
        param[0] = param[0].split(prefix)[1];

        util.checkalias(param[0].toLowerCase(), commands,function(err,command){
            if(command.perms.length>0){
                var allowed = false;
                for(var i=0;i<command.perms.length;i++){
                    if(message.member.roles.has(message.member.guild.roles.find("name", command.perms[i]).id)) {
                        allowed = true;
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
                    message.delete();
                    message.channel.send(command.content);
                    break;

                case "say":
                    message.mentions.channels.forEach(function(channel){
                        param.shift();
                        param.shift();
                        channel.send((param.join(" ")).split("\\n").join("\n"));
                    });
                    break;

                case "embed":
                    var embed = new Discord.RichEmbed()
                    .setColor(0x7C00B9)
                    .setImage(command.content);
                     message.channel.send({embed});
                    break;

                case "add":
                    var name = param[2].toLowerCase();
                    var type = param[1].toLowerCase();
                    param.shift();
                    param.shift();
                    param.shift();
                    commands.save({
                        "name":name,
                        "type":type,
                        "content": (param.join(" ")).split("\\n").join("\n"),
                        "perms":[]
                    });
                    message.reply("Command added");
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
                    var query = {"name":param[1].toLowerCase()};
                    commands.remove(query);
                    message.reply("Command removed");
                    break;

                case "perms":
                    commands.find({"name":param[1]},function(err,result){
                        if(result.length > 0){
                            var type = param[2];

                            switch(type){
                                case "add":
                                    result[0].perms.push( param[3] );
                                    commands.save(result[0]);
                                    break;

                                case "remove":
                                    result[0].perms = command.perms.filter(e => e !== param[3]);
                                    commands.save(result[0]);
                                    break;
                            }
                        }else{
                            message.reply("Couldnt find " + param[1]);
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
                                "desc":quote.content + "\nQuote id: " + count,
                                "title":"#" + quote.channel.name,
                                "author":quote.author.username,
                                "thumb":thumb,
                                "color":color,
                                "avatar": quote.author.avatarURL
                            })

                            client.channels.get('344238216624341002').send({embed});
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

                case "default":
                default:
                    message.reply('This command is not on our realm');
                    break;
            }
        })
    }
});

client.login(process.env.discord_token);
