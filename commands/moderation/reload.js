var fs = require("fs");

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var commandName = param[1].toLowerCase();
        if(commandName){
            message.delete();

            var modulePath = `${__dirname}/${commandName}.js`;
            if(client.commands.has(commandName) || fs.existsSync(modulePath)){
                delete require.cache[require.resolve(`./${commandName}.js`)];

                client.commands.set(commandName, require(`./${commandName}.js`));
                message.channel.send(`Reloaded ${commandName}!`);
            }else{
                message.channel.send(`${commandName}.js couldnt be found.`)
            }
        }
}
}
