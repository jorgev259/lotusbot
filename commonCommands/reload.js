var fs = require("fs");
var path = require("path");

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var commandName = param[1].toLowerCase();
        if(commandName){          
            var commandsPath = path.resolve("../", client.user.username.toLowerCase(),"commands")
            var modulePath = `${commandsPath}/${commandName}.js`;
            if(client.commands.has(commandName) || fs.existsSync(modulePath)){
                delete require.cache[require.resolve(modulePath)];

                client.commands.set(commandName, require(modulePath));
                message.channel.send(`Reloaded ${commandName}!`);
            }
        }
    }
}