const Discord = require('discord.js');
var json = require('jsonfile')
var fs = require("fs");

var util = require('./utilities.js');


const SpoilerBot = require('discord-spoiler-bot');
 
let config = {
    token: (require("../data/tokens.json").akira),
};
 
let bot = new SpoilerBot(config);
bot.connect();

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands');
const commonCommands = fs.readdirSync('./commonCommands');
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(file.split(".js")[0], command);
}
for (const file of commonCommands) {
    const command = require(`./commonCommands/${file}`);
    client.commands.set(file.split(".js")[0], command);
}

var commands = require("../data/commands.json");
var vc = require("./vc.js")(client);

client.on('ready', () => {
	util.log(client,'I am ready!');
});

client.on('debug',info=>{
	if(typeof info === 'string' && !info.startsWith("[ws]")){
		util.log(client,info);
	}
})

client.on("guildMemberAdd", (member) => {
	util.userCheck(member.id,client)

	var exp = json.readFileSync("../data/exp.json");
	member.guild.channels.find("name","main-lounge").send(`Welcome to Fandom Circle, <@${member.id}>! Have Fun`);
	member.addRole(member.guild.roles.find("name", "☕ - Customers"),"User join");
});

/*client.on("messageReactionAdd",(reaction,user)=>{
    if(user.id != client.user.id && reaction.message.channel.name == "art"){
        art.find({"id":reaction.message.id},function(err,result){
            if(result.length>0){
                util.checkReact(reaction,user,result[0])
            }
        })
    }
});

client.on("messageReactionRemove",(reaction,user)=>{
    if(reaction.message.channel.name == "art"){
        var count =  util.emojiCount(reaction,user);
        if(count == 0){
            art.find({"id":reaction.message.id},function(err,result){
                if(result.length>0){
                    result[0].score = result[0].score - util.findEmoji(reaction.emoji.name);
                    art.save(result[0]);
                }
            })
        }
    }
})*/

client.on('message', message => {
	try{
		util.exp(message,client);
		var prefix = ">";

		if(message.content.startsWith(prefix) || message.content.startsWith("<@!" + client.user.id + ">")){			
			var param = message.content.split(" ");

			if(message.content.startsWith(prefix)){
				param[0] = param[0].split(prefix)[1];
			}else{
				param.splice(0,1);
			}

			const commandName = param[0].toLowerCase();
			var command = commands[commandName];

			if(util.permCheck(message,commandName)){
				if(command == undefined){command = {}; command.type = param[0].toLowerCase()};
				if (!client.commands.has(command.type)) return;
				
				client.commands.get(command.type).execute(client, message, param);
			}
		}

		switch(message.channel.name){
			case "creations":
				/*if(message.attachments.size > 0){
                       art.save({"id":message.id,"score":0,"author":message.author.id});
                   }*/
				if(message.attachments.size > 0 || message.embeds.length>0){
					util.reactNumber(0,5,message);
				}else{

				}
				break;
			
			case "news-n-stuff":
				util.react(message);
				break;

			case "akira":
				util.talk(client,message);
				break;
		}
	}catch(e){
		util.log(client,`${e}\nSource: ${__filename.split("/root/bots/")[1]}`);
	}
});

client.login(require("../data/tokens.json").akira);