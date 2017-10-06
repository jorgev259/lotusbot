const Discord = require('discord.js');
var fs = require("fs");
const client = new Discord.Client();

var commands = require("../data/maya.json");
var config = require("../data/config.json");
var util = require('../akira/utilities.js');

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    if(message.content.startsWith("+reactadd")){
        var param = message.content.split(" ");
        var url = param[1];
        param.shift();
        param.shift();
        var name = param.join(" ").toLowerCase();

        if(commands[name] != undefined){
            commands[name].content.push(url);
            util.save(commands,"maya");
            message.reply("Command udpated");
        }else{
            var content = [url];

            commands[name] = {
                "content": content,
            };

            util.save(commands,"maya");
            message.reply("Command added");
        }
    }else if(message.content.startsWith("+reactremove")){
        var param = message.content.split(" ");
        param.shift();
        var name = param.join(" ").toLowerCase();
        if(commands[name] != undefined){
            delete commands[name];
            message.reply("reaction removed");
        }else{
            message.reply("The reaction you are trying to remove doesnt exist");
        }
    }else{
        Object.keys(commands).forEach(function(key){
            if(message.content.toLowerCase().includes(key)){
                var command = commands[key]

                message.channel.send("",{files: [command.content[0]]});
                if(command.content.length>1){
                    var first = command.content[0];
                    for(var i=1;i<command.content.length;i++){
                        command.content[i-1] = command.content[i];
                    };
                    command.content[command.content.length - 1] = first;
                    commands[key] = command;
                    util.save(commands,"maya");
                }
            }
        })
    }
});

client.login(config.tokenMaya);
