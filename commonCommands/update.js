var path = require("path");
var util = require('../utilities.js');

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        try{
            const git = require('simple-git')(path.resolve("../", client.user.username.toLowerCase()));
            message.delete();

            message.channel.send("Downloading changes.....").then(m=>{
                git.pull((err,res)=>{               
                    if(err){
                        util.log(client,err);
                        return m.edit("Git pull failed!")
                    }
                    console.log(res);
                    if(res.files.length>0){
                        m.edit(`Git pull successful!\nModified files: ${res.files.join(" ,")}\nSummary: ${JSON.stringify(res.summary).split("{")[1].split("}")[0]}`);
                        res.files.forEach(file => {

                            var commandsPath = path.resolve("../", client.user.username.toLowerCase())
                            var modulePath;
                            var commandName;

                            if(file.startsWith("commands")){ 
                                commandName = file.split("commands/")[1];     
                                commandsPath = path.resolve(commandsPath, "commands");                       
                            }else if(file.startsWith("commonCommands")){ 
                                commandName = file.split("commonCommands/")[1];
                                commandsPath = path.resolve(commandsPath, "commonCommands");
                            }else{
                                return;
                            }

                            modulePath = `${commandsPath}/${commandName}`;
                            delete require.cache[require.resolve(modulePath)];

                            const command = require(modulePath);

                            client.commands.set(commandName.split(".js")[0], command);
                            if(command.alias){
                                command.alias.forEach(alias => client.commands.set(alias, command))
                            }
                            util.log(client, `Reloaded ${commandName}`)

                        })
                    }else{
                        m.edit("Already up to date!");
                    }
                })
            })      
        }catch(e){
            util.log(client,`${e}\nSource: ${__filename.split('/root/bots/')[1]}`)
        }
    }
}