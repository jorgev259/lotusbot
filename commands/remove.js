var commands = require("../../data/commands.json");
var util = require('../utilities.js');

module.exports = {
    desc:"Deletes an embed command. Usage: >remove <name>",
    async execute(client, message, param){
            var exCommand = commands[param[1].toLowerCase()];
            if(exCommand != undefined){
                delete commands[param[1].toLowerCase()];
                await util.save(commands,"commands");
                message.reply("Command removed");
            }else{
                message.reply("Command doesnt exist");
            }
    }
}
