var util = require("../utilities.js")

module.exports = {
    desc:"This command displays information about a command. Usage: >help command",
    execute(client, message, param){
        if(param[1]){
            if (client.commands.has(param[1].toLowerCase())){
                message.channel.send(client.commands.get(param[1].toLowerCase()).desc);
            }else{
                message.channel.send(`${param[1]} couldnt be found`)
            }
        }else{
            var commands = ""
            Array.from(client.commands.keys()).forEach(idName => {
                if(util.permCheck(message,idName)){
                    commands += `${idName}: ${client.commands.get(idName).desc}\n`
                }               
            })
            message.author.send(commands, {code:"xl",split:true});
        }
        
    }
}