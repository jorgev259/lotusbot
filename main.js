const Discord = require('discord.js');
var fs = require("fs");
const client = new Discord.Client();
var util = require('./utilities.js');
let prefix = "!";

var commands = JSON.parse(fs.readFileSync('commands.json', 'utf8'));
var words =JSON.parse(fs.readFileSync('words.json', 'utf8'));

var express = require('express');
var app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

app.listen(port, function() {});

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
    if(message.content.startsWith(prefix)){
        var param = message.content.split(" ");
        param[0] = param[0].split(prefix)[1];
        var command = util.checkalias(param[0]);
            
        if(command.type == "execute"){command.type = param[0]};
        switch(command.type){       
            case "simple":
                message.channel.send(command.content);
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
                commands[name] = {
                    "type":type,
                    "content": (param.join(" ")).split("\\n").join("\n"),
                    "alias":[]
                };
                fs.writeFileSync('commands.json',JSON.stringify(commands), 'utf8');
                message.reply("Command added");
                message.delete();
                break;
                
            case "alias":
                if(!commands[param[1]].alias){commands[param[1]].alias = [];};
                commands[param[1]].alias.push( param[2]);
                fs.writeFileSync('commands.json',JSON.stringify(commands), 'utf8');
                message.edit("Alias added");
                break;
                    
            case "show":
                console.log(JSON.parse(fs.readFileSync(param[1] + ".json", 'utf8')));
                break;
                
            case "word":
                var name = param[1];
                param.shift();
                param.shift();
                words[name] = param.join(" ");
                fs.writeFileSync('words.json',JSON.stringify(words), 'utf8')
                break;
                    
            case "remove":
                delete commands[param[1]];
                fs.writeFileSync('commands.json',JSON.stringify(commands), 'utf8');
                message.reply("Command removed");
                message.delete();
                break;
                
            case "default":
            default:
                message.reply('This command is not on our realm');
                break;
        }
    }
});

client.login("MzM5NDQ3MjMxOTM1Njc2NDE2.DGOR2A.mrxigkCDPyuKPC1mQ6C13_BWB_c");
