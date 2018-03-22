const Discord = require('discord.js');
var util = require('../../utilities.js');

module.exports = {
    execute(client, message, param){
            var command = client.data.commands[param[0].toLowerCase()];

            message.channel.send(new Discord.MessageAttachment(command.content[0])).then(function(message){
                if(command.content.length>1){
                    var first = command.content[0];
                    for(var i=1;i<command.content.length;i++){
                        command.content[i-1] = command.content[i];
                    };
                    command.content[command.content.length - 1] = first;
                    client.data.commands[param[0].toLowerCase()] = command;
                    util.save(client.data.commands,"commands");
                }
            },function(error){
                util.log(client,param[0] + " failed with " + error + "\n " + command.content[0])
                if(error == "Error: 403 Forbidden"){
                    util.log(client, "removed " + command.content[0] + " from " + param[0].toLowerCase());
                    command.content.splice(0,1);
                    client.data.commands[param[0].toLowerCase()] = command;
                    util.save(client.data.commands,"commands");
                }
            })
    }
}
