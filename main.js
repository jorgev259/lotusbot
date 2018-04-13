const Discord = require('discord.js');
const fs = require("fs");
const glob = require('glob');
const moment = require('moment')
const sqlite = require("sqlite");
let db;
startDB();
async function startDB(){
	db = await sqlite.open('./data/database.sqlite');
	await db.run(`CREATE TABLE IF NOT EXISTS exp (id TEXT, color TEXT, exp, lastDaily TEXT, lvl INT, money INT, rank INT, bg TEXT, UNIQUE(id));
				CREATE TABLE IF NOT EXISTS nicks (id TEXT, nick TEXT, UNIQUE(id));`)
}
var colors = ["pink","d-blue","purple","l-blue","green","red"];
var util = require('./utilities.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

let commandFiles = glob.sync(`commands/**/*`);
let dataFiles = glob.sync(`data/*`);

client.data = {};
for (const file of dataFiles) {	
	if(!file.endsWith(".json")) continue;	
	const data = require(`./${file}`);

	let path_array = file.split("/");
	let name = path_array[path_array.length - 1].split(".json")[0];
	client.data[name] = data
}

for (const file of commandFiles) {
	if(!file.endsWith(".js")) continue;	
	const command = require(`./${file}`);

	let path_array = file.split("/");
	let name = path_array[path_array.length - 1].split(".js")[0];
	client.commands.set(name, command);
	client.commands.get(name).type = path_array[path_array.length-2];
	if(command.alias){
		command.alias.forEach(alias => {
			client.commands.set(alias, command)
			client.data.perms[alias] = client.data.perms[name];
		})		
	}	
}

client.on('ready', async () => {
	await util.log(client,'I am ready!');
	let colorRoles = {};
	let groupRoles = {};

	let guild = client.guilds.first();
	let roles = guild.roles.filter(role  => role.position < guild.roles.find('name','//Colors').position && role.position > guild.roles.find('name','//End Colors').position).sort(function (a, b) {return a.position- b.position})
	let roles2 = guild.roles.filter(role  => role.position < guild.roles.find('name','//Groups').position && role.position > guild.roles.find('name','//End Groups').position && !role.name.startsWith('🔮') && role.name != "--------").sort(function (a, b) {return a.position- b.position})
	let section = [];
	roles.forEach(role => {	
		if(role.name == "--------"){
			colorRoles[colors[Object.keys(colorRoles).length]] = section;
			section = [];
		}else{
			section.push(role);
		}
	})
	colorRoles[colors[Object.keys(colorRoles).length]] = section;

	roles2.forEach(role => {	
		groupRoles[colors[Object.keys(groupRoles).length]] = role;
	})

	client.data.colorRoles = colorRoles;
	client.data.groupRoles = groupRoles;

	if(moment().isSame(client.data.info.lastPFP,'day')){
		var nextDay = moment(client.data.info.lastPFP).add(1, 'day').format('YYYY-MM-DD');

		util.log(client, `Next profile pic change and backups scheduled to happen ${moment().to(nextDay)}`)
		setTimeout(util.swapPFP, moment(nextDay).diff(moment()), client)
	}else{
		util.log(client, `Starting profile change`)
		util.swapPFP(client);
	}
});

client.on("guildMemberAdd", async member => {
	await util.userCheck(member.id,client)
	var name = member.user.username;
	if(client.data.nicks[member.id] == undefined) {
		member.setNickname(name + " ☕");
		//await db.run("INSERT OR REPLACE INTO nicks (id,nick) VALUES (?,?)", [member.id, name + " ☕"]);
	}else{
		member.setNickname(client.data.nicks[member.id],"Locked nickname");
	}
	member.guild.channels.find("name","main-lounge").send(`Welcome to Fandom Circle, ${member}! Have Fun`);
});

client.on("guildMemberUpdate", async (oldMember,newMember) => {
	if(oldMember.nickname != newMember.nickname){
		//await db.run("INSERT OR REPLACE INTO nicks (id,nick) VALUES (?,?)", [member.id, newMember.nickname]);
	}
})

client.on('message', async message => {
		await util.exp(message,client);
		var prefix = ">";

		if(message.content.startsWith(prefix) || message.content.startsWith("<@!" + client.user.id + ">")){			
			var param = message.content.split(" ");

			if(message.content.startsWith(prefix)){
				param[0] = param[0].split(prefix)[1];
			}else{
				param.splice(0,1);
			}

			
			const commandName = param[0].toLowerCase();
			var command = client.data.commands[commandName];
			if(await util.permCheck(message,commandName, client)){				
				if(command == undefined){command = {}; command.type = param[0].toLowerCase()};
				if (!client.commands.has(command.type)) return;				
				client.commands.get(command.type).execute(client, message, param, db);
			}
		}

		switch(message.channel.name){
			case "nickname-change":
				if(!message.author.bot){
					var emoji = message.member.nickname.split(" ").pop();

					var namechange = message.content + " " + emoji;
					if(namechange.length < 32){
						client.data.nicks[message.member.id] = namechange;

						message.member.setNickname(namechange,"Name Change sponsored by Monokuma").then(()=>{
							util.save(client.data.nicks,"nicks").then(()=>{
								message.delete(namechange);
								message.member.roles.remove([message.guild.roles.find("name","⭕ Nickname Change")],"Nickname change")
							})							
						})
					}else{
						message.delete();
						message.author.send("That nickname is too long");
					}
				}
				break;

			case "shop":
				message.delete();
				break;
						
			case "akira":
				util.talk(client,message);
				break;
		}
});

process.on('unhandledRejection', err => util.log(client,err.stack));
client.login(client.data.tokens.akira);