var util = require('../../utilities.js');

module.exports = {
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
