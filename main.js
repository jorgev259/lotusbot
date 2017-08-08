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
    ((client.guilds.get('289758148175200257')).channels.get('289758148175200257')).send("Welcome to Fandom Circle, <@" + member.id + ">! Have Fun");
});

client.on('message', message => {
    if(message.content.startsWith(prefix)){
        var param = message.content.split(" ");
        param[0] = param[0].split(prefix)[1];
        util.checkalias(param[0].toLowerCase(), commands,function(err,command){
            if(command.perms.length>0){
                var allowed = false;
                for(var i=0;i<command.perms.length;i++){
                    if(message.member.roles.has(command.perms[i])) {
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
                    var query = {"name":param[1]};
                    commands.remove(query);
                    message.reply("Command removed");
                    break;

                case "perms":
                    switch(param[1]){
                        case "add":
                            message.mentions.roles.forEach(function(role){
                                command.perms.push( role.id );
                            });
                            commands.save(command);
                            break;

                        case "remove":
                            message.mentions.roles.forEach(function(role){
                                command.perms = command.perms.filter(e => e !== role.id);
                            });
                            commands.save(command);
                            break;
                    }
                    break;

                case "addquote":
                    message.channel.fetchMessage(param[1]).then(function(quote){
                        quotes.count(function(err,count){
                            var embed = new Discord.RichEmbed()
                            .setColor(0x7C00B9)
                            .setDescription(quote.content + "\nQuote id: " + count)
                            .setTitle("#" + quote.channel.name)
                            .setThumbnail("https://gamefaqs.akamaized.net/faqs/25/74625-32.png")
                            .setAuthor(quote.author.username, quote.author.avatarURL);

                            quotes.save({
                                "id":count,
                                "desc":quote.content + "\nQuote id: " + count,
                                "title":"#" + quote.channel.name,
                                "author":quote.author.username,
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
                            .setColor(0x7C00B9)
                            .setDescription(quote.desc)
                            .setTitle(quote.title)
                            .setThumbnail("https://gamefaqs.akamaized.net/faqs/25/74625-32.png")
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
