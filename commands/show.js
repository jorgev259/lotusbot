var commands = require("../../data/commands.json");

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var commandList = Object.keys(commands).filter(function(key){
            return commands[key].type == param[1];
        })
        if(commandList.length>0){
            var final = "```" + commandList[0];
            for(var i=1;i<commandList.length;i++){
                final += ", " + commandList[i];
            };
            message.reply(final + "```");
        }else{
            message.reply("no matching results");
        }
    }
}