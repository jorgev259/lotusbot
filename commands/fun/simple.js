function deletem(msg){
    msg.delete(); 
    return "";
};

module.exports = {
    execute(client, message, param){
        var commands = client.data.commands;
        var command = commands[param[0].toLowerCase()];
        message.channel.send(eval("`" + command.content + "`"));
    }
}
