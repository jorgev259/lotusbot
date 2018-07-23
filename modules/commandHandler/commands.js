function params(param){
    return param.slice(1,param.length).join(" ");
};

const Discord = require('discord.js');
var util = require('../../utilities.js');

module.exports = {
    commands:{
        simple:{
            execute(client, message, param, db){	
                var commands = client.data.commands;	         
                var command = commands[param[0].toLowerCase()];	        
                message.channel.send(eval("`" + command.content + "`"));
            }
        },

        webhook:{
            async execute(client, message, param, db){
                let commands = client.data.commands;
                let command = commands[param[0].toLowerCase()];
                let hooks = (await message.channel.fetchWebhooks()).filter(h => h.name == "simple");
        
                let hook;
                if(hooks.size == 0) hook = await message.channel.createWebhook("simple", { avatar: message.author.displayAvatarURL()});  
                else{
                    hook = hooks.first();
                    await hook.edit({'avatar': message.author.displayAvatarURL()})
                } 
                message.delete();     
                hook.sendSlackMessage({
                    'username': '[💬]',
                    'text': eval("`" + command.content + "`")
                }).catch(console.error);   
            }
        },

        embed:{
            execute(client, message, param, db){
                var command = client.data.commands[param[0].toLowerCase()];

                message.channel.send(new Discord.MessageAttachment(command.content[0])).then(function(message){
                    if(command.content.length>1){
                        var first = command.content[0];
                        for(var i=1;i<command.content.length;i++){
                            command.content[i-1] = command.content[i];
                        };
                        command.content[command.content.length - 1] = first;
                        client.data.commands[param[0].toLowerCase()] = command;
                        util.save(client.data.commands,"commands");
                    }
                },function(error){
                    util.log(client,param[0] + " failed with " + error + "\n " + command.content[0])
                    if(error == "Error: 403 Forbidden"){
                        util.log(client, "removed " + command.content[0] + " from " + param[0].toLowerCase());
                        command.content.splice(0,1);
                        client.data.commands[param[0].toLowerCase()] = command;
                        util.save(client.data.commands,"commands");
                    }
                })
            }
        },

        add: {
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
        },

        remove: {
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
        },

        perms: {
            desc:"Adds or removes permissions to a command. Usage: perms <command> <add│remove> <#channel│@user│roleName>",
            async execute(client, message, param, db){
                var name = param[1];
                var type = param[2];
                param = param.slice(3)

                switch(type){
                    case "add":
                        if(message.mentions.users.size > 0){
                            await db.run("INSERT INTO perms (command,type,item) VALUES (?,?,?)", [name,"user",message.mentions.users.first().id])
                        }else if(message.mentions.channels.size > 0){
                            await db.run("INSERT INTO perms (command,type,item) VALUES (?,?,?)", [name,"channel",message.mentions.channels.first().name])
                        }else{
                            await db.run("INSERT INTO perms (command,type,item) VALUES (?,?,?)", [name,"role",param.join(" ")])
                        }
                        message.reply(param.join(" ") + " is now allowed to use " + name);
                        break;

                    case "remove":
                        if(message.mentions.users.size > 0){
                            await db.run("DELETE FROM perms WHERE command='?' AND type='user' AND item='?'", [name, message.mentions.users.first().id])
                        }else if(message.mentions.channels.size > 0){
                            await db.run("DELETE FROM perms WHERE command='?' AND type='channel' AND item='?'", [name, message.mentions.channels.first().name])
                        }else{
                            await db.run("DELETE FROM perms WHERE command='?' AND type='role' AND item='?'", [name, param.join(" ")])
                        }
                        message.reply("Removed " + param.join(" ") + " from the command " + name);
                        break;
                }
            }
        }
    }
}