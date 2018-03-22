var util = require('../../utilities.js');

module.exports = {
    desc:"Adds a new command to Akira. Usage: >add <type> <name> <link>",
    async execute(client, message, param){
        var name = param[2].toLowerCase();
        var type = param[1].toLowerCase();
        param = param.slice(3);
        if(client.data.commands[name] != undefined && type === "embed"){
            client.data.commands[name].content.push(param.join(" "));
            await util.save(client.data.commands,"commands");
            message.reply("Command udpated");
        }else if(client.data.commands[name] == undefined){
            if(type === "embed"){
                content = [param.join(" ").split("\\n").join("\n")];
            }else{
                content = param.join(" ").split("\\n").join("\n");
            }

            client.data.commands[name] = {
                "type":type,
                "content": content,
                "perms":[]
            };             
            message.reply("Command added");
        }else{
            return message.reply("That command already exists, choose another name");
        }
        await util.save(client.data.commands,"commands");
    }
}
