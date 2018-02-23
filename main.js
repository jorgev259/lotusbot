const Discord = require('discord.js');
var json = require('jsonfile')
var fs = require("fs");

var util = require('./utilities.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands');
const commonCommands = fs.readdirSync('./commonCommands');
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(file.split(".js")[0], command);
	if(command.alias){
		command.alias.forEach(alias => client.commands.set(alias, command))
	}
}
for (const file of commonCommands) {
    const command = require(`./commonCommands/${file}`);
	client.commands.set(file.split(".js")[0], command);
	if(command.alias){
		command.alias.forEach(alias => client.commands.set(alias, command))
	}
}

var commands = require("../data/commands.json");
//var spoiler = require("./spoiler.js")();

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

client.on('message', async message => {
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

			if(await util.permCheck(message,commandName)){
				if(command == undefined){command = {}; command.type = param[0].toLowerCase()};
				if (!client.commands.has(command.type)) return;
				client.commands.get(command.type).execute(client, message, param);
			}
		}

		switch(message.channel.name){			
			case "akira":
				util.talk(client,message);
				break;
		}
	}catch(e){
		util.log(client,`${e}\nSource: ${__filename.split("/root/bots/")[1]}`);
	}
});

client.login(require("../data/tokens.json").akira);