var util = require('../../utilities.js');
module.exports = {
    desc:"Deletes an embed command. Usage: >remove <name>",
    async execute(client, message, param){
            var exCommand = client.data.commands[param[1].toLowerCase()];
            if(exCommand != undefined){
                delete client.data.commands[param[1].toLowerCase()];
                await util.save(client.data.commands,"commands");
                message.reply("Command removed");
            }else{
                message.reply("Command doesnt exist");
            }
    }
}
