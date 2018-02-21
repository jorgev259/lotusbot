var perms = require("../../data/perms.json");
var util = require('../utilities.js');

module.exports = {
    desc:"Adds or removes permissions to a command. Usage: perms <command> <add│remove> <#channel│@user│roleName>",
    execute(client, message, param){
        try{
            var name = param[1];
            var type = param[2];
            param = param.slice(3);

            if(perms[name] != undefined){
                switch(type){
                    case "add":
                        if(message.mentions.users.size > 0){
                            perms[name].user.push(message.mentions.users.first().id);
                        }else if(message.mentions.channels.size > 0){
                            perms[name].channel.push(message.mentions.channels.first().id);
                        }else{
                            perms[name].role.push(param.join(" "));
                        }
                        util.save(perms,"perms");
                        message.reply(param.join(" ") + " is now allowed to use " + name);
                        break;

                        /*case "remove":
                                        result[0].perms = result[0].perms.filter(e => e !== param.join(" ") );
                                        perms.save(result[0]);
                                        message.reply("Removed " + param.join(" ") + " from the command " + name);
                                        break;*/
                }
            }else{
                switch(type){
                    case "add":
                        perms[name] = {"user":[], "role":[], "channel":[]};

                        if(message.mentions.users.size > 0){
                            perms[name].user.push(message.mentions.users.first().id);
                        }else if(message.mentions.channels.size > 0){
                            perms[name].channel.push(message.mentions.channels.first().id);
                        }else{
                            perms[name].role.push(param.join(" "));
                        }

                        util.save(perms,"perms");
                        message.reply(param.join(" ") + " is now allowed to use " + name);
                        break;

                    case "delete":
                        message.reply("This command has no permissions set");
                }
            }
        }catch(e){
            util.log(client,`${e}\nSource: ${__filename.split('/root/bots/')[1]}`)
        }
    }
}