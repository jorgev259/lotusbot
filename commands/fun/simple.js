function deletem(param, msg, flag){
    msg.delete(); 
    if(flag) return param.slice(1,param.length).join(" ");
    else return "";
};

module.exports = {
    execute(client, message, param){
        var commands = client.data.commands;
        var command = commands[param[0].toLowerCase()];
        message.channel.send(eval("`" + command.content + "`"));
    }
}
