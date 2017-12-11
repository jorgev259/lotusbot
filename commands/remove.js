var commands = require("../../data/commands.json");
var util = require('../utilities.js');

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var exCommand = commands[param[1].toLowerCase()];
        if(exCommand != undefined){
            delete commands[param[1].toLowerCase()];
            util.save(commands,"commands");
            message.reply("Command removed");
        }else{
            message.reply("Command doesnt exist");
        }
    }
}