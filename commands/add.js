var commands = require("../../data/commands.json");
var util = require('../utilities.js');

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var name = param[2].toLowerCase();
        var type = param[1].toLowerCase();
        param = param.slice(3);
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
    }
}