var fs = require("fs");

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var commandName = param[1].toLowerCase();
        if(commandName){
            message.delete();

            var modulePath = `${__dirname}/${commandName}.js`;
            if(client.commands.has(commandName)){
                client.commands.delete(commandName);
                message.channel.send(`Disabled ${commandName}!`);
            }else{
                message.channel.send(`${commandName}.js couldnt be found.`)
            }
        }
    }
}