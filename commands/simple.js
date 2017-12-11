var commands = require("../../data/commands.json");

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var command = commands[param[0].toLowerCase()];
        message.channel.send(eval("`" + command.content + "`"));
    }
}