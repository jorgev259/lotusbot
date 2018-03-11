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
//Megumin, Akira, Tohru, Shiro, Miu, Rem
var colorRoles = {};
var groupRoles = {};

client.on('ready', async () => {
	await util.log(client,'I am ready!');

	let result = util.getRoles(client);
	colorRoles = result[0];
	groupRoles = result[1];
});

client.on("guildMemberAdd", async member => {
	await util.userCheck(member.id,client)

	let exp = json.readFileSync("../data/exp.json");
	member.guild.channels.find("name","main-lounge").send(`Welcome to Fandom Circle, ${member}! Have Fun`);

	let roles = [colorRoles[exp[member.id].color][exp[member.id].rank], groupRoles[exp[member.id].color]];
	member.roles.add(roles,"User join");
});

client.on("guildMemberUpdate", async (oldMember,newMember) => {
	if(oldMember.nickname != newMember.nickname){
		var nicks = json.readFileSync("../data/nicks.json");
		nicks[newMember.id] = newMember.nickname;
		await util.save(nicks,"nicks");
	}
})

client.on('message', async message => {
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

			if(await util.permCheck(message,commandName, client)){
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
});

process.on('unhandledRejection', err => util.log(client,err.stack));
client.login(require("../data/tokens.json").akira);