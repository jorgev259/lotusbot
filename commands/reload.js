module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var commandName = param[1].toLowerCase();
        if(commandName){
            message.delete();

            if(client.commands.has(commandName) && fs.existsSync(`./${commandName}.js`,function(){})){
                client.commands.set(commandName, fs.readFileSync(`./${commandName}.js`,function(){}));
                message.channel.send(`Reloaded ${commandName}!`);
            }else{
                message.channel.send(`${commandName} couldnt be found.`)
            }
        }
    }
}