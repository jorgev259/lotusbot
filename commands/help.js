module.exports = {
    desc:"This command displays information about a command. Usage: >help command",
    execute(client, message, param){
        if (param[1] && client.commands.has(param[1].toLowerCase())){
            message.channel.send(client.commands.get(param[1].toLowerCase()).desc);
        }else if(param[1]){
            message.channel.send(`${param[1]} couldnt be found`)
        }
    }
}