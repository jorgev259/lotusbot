var commands = require("../../data/commands.json");
var util = require('../utilities.js');

module.exports = {
    desc:"Deletes an embed command. Usage: >remove <name>",
    execute(client, message, param){
        try{
            var exCommand = commands[param[1].toLowerCase()];
            if(exCommand != undefined){
                delete commands[param[1].toLowerCase()];
                util.save(commands,"commands");
                message.reply("Command removed");
            }else{
                message.reply("Command doesnt exist");
            }
        }catch(e){
            util.log(client,`${e}\nSource: ${__filename.split('/root/bots/')[1]}`)
        }
    }
}