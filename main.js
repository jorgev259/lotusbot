const Discord = require('discord.js');
var fs = require("fs");
const client = new Discord.Client();
var util = require('./utilities.js');

var config =JSON.parse(fs.readFileSync('config.json', 'utf8'));
var prefix = config.prefix;

var mongojs = require('mongojs');
var db = mongojs(process.env.mongourl);
var commands = db.collection('commands');

client.on('ready', () => {
    console.log('I am ready!');
    client.channels.get('343618467972382734').join();
});

client.on('message', message => {
    if(message.content.startsWith(prefix)){
        var param = message.content.split(" ");
        param[0] = param[0].split(prefix)[1];
        util.checkalias(param[0], commands,function(err,command){
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
                    .setColor(0x00AE86)
                    .setImage(command.content);
                     message.channel.send({embed});
                    break;

                case "add":
                    var name = param[2];
                    var type = param[1];
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
                    var messageOut = "";
                    var keys = Object.keys(commands);
                    var i = 0;
                    var out = {};
                    for(i=0;i<keys.length;i++){
                        console.log(commands[keys[i]].type);
                        if(commands[keys[i]].type === param[1]){
                            messageOut += key + ", ";
                        }
                    }
                    message.reply(messageOut);
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
                                commands[param[2]].perms.push( role.id );
                            });
                            break;

                        case "remove":
                            message.mentions.roles.forEach(function(role){
                                commands[param[2]] = commands[param[2]].filter(e => e !== role.id);
                            });
                            break;
                    }
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
