module.exports = {
    desc:"This command displays information about a command. Usage: >help command",
    execute(client, message, param){
        if (client.commands.has(param[1].toLowerCase())){
            message.channel.send(client.commands.get(param[1].toLowerCase()).desc);
        }else{
            message.channel.send(`${param[1]} couldnt be found`)
        }
    }
}