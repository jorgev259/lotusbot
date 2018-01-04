var commands = require("../../data/commands.json");

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
try{
        var command = commands[param[0].toLowerCase()];
        message.channel.send(eval("`" + command.content + "`"));
    }
catch(e){
util.log(client,`${e}
Source: ${__filename.split('/root/bots/')[1]}`)
}
}
}