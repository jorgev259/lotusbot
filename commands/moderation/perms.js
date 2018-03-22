var util = require('../../utilities.js');

module.exports = {
    desc:"Adds or removes permissions to a command. Usage: perms <command> <add│remove> <#channel│@user│roleName>",
    async execute(client, message, param){
            var name = param[1];
            var type = param[2];
            param = param.slice(3)
            if(client.data.perms[name] != undefined){
                switch(type){
                    case "add":
                        if(message.mentions.users.size > 0){
                            client.data.perms[name].user.push(message.mentions.users.first().id);
                        }else if(message.mentions.channels.size > 0){
                            client.data.perms[name].channel.push(message.mentions.channels.first().id);
                        }else{
                            client.data.perms[name].role.push(param.join(" "));
                        }
                        await util.save(client.data.perms,"perms");
                        message.reply(param.join(" ") + " is now allowed to use " + name);
                        break;

                        case "remove":
                            if(message.mentions.users.size > 0){
                                var index = client.data.perms[name].user.indexOf(message.mentions.users.first().id);
                                if(index >= 1){
                                    client.data.perms[name].user.splice(index, 1);
                                }
                            }else if(message.mentions.channels.size > 0){
                                var index = client.data.perms[name].channel.indexOf(message.mentions.channels.first().id);
                                if(index >= 1){
                                    client.data.perms[name].channel.splice(index, 1);
                                }
                            }else{
                                var index = client.data.perms[name].role.indexOf(param.join(" "));
                                if(index >= 1){
                                    client.data.perms[name].role.splice(index, 1);
                                }
                            }
                            
                            await util.save(client.data.perms,"perms");
                            message.reply("Removed " + param.join(" ") + " from the command " + name);
                            break;
                }
            }else{
                switch(type){
                    case "add":
                        client.data.perms[name] = {"user":[], "role":[], "channel":[]};

                        if(message.mentions.users.size > 0){
                            client.data.perms[name].user.push(message.mentions.users.first().id);
                        }else if(message.mentions.channels.size > 0){
                            client.data.perms[name].channel.push(message.mentions.channels.first().id);
                        }else{
                            client.data.perms[name].role.push(param.join(" "));
                        }

                        await util.save(client.data.perms,"perms");
                        message.reply(param.join(" ") + " is now allowed to use " + name);
                        break;

                    case "delete":
                        message.reply("This command has no permissions set");
                }
            }
    }
}
