var fs = require("fs");

module.exports = {
    execute(client, message, param){
        try{
            var commandName = param[1].toLowerCase();
            if(commandName){               
                var modulePath = `${__dirname}/${commandName}.js`;
                if(client.commands.has(commandName)){
                    client.commands.delete(commandName);
                    await message.channel.send(`Disabled ${commandName}!`);
                }else{
                    await message.channel.send(`${commandName}.js couldnt be found.`)
                }

                message.delete();
            }
        }catch(e){
            util.log(client,`${e}\nSource: ${__filename.split('/root/bots/')[1]}`)
        }
    }
}