const Discord = require('discord.js');
const fs = require("fs");
const glob = require('glob');

const sqlite = require("sqlite");
let db;
startDB();
async function startDB(){
	db = await sqlite.open('data/database.sqlite');
	await db.run(`CREATE TABLE IF NOT EXISTS exp (id TEXT, color TEXT, exp, lastDaily TEXT, lvl INT, money INT, rank INT, bg TEXT, UNIQUE(id));`);
	await db.run(`CREATE TABLE IF NOT EXISTS nicks (id TEXT, nick TEXT, UNIQUE(id));`);
	await db.run(`CREATE TABLE IF NOT EXISTS inventory (id TEXT, type TEXT, item TEXT);`);
	await db.run(`CREATE TABLE IF NOT EXISTS badges (id TEXT, number INTEGER, item TEXT);`);
	await db.run(`CREATE TABLE IF NOT EXISTS perms (type TEXT, item TEXT, command TEXT);`);
}
var colors = ["pink","d-blue","purple","l-blue","green","red"];
var util = require('./utilities.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

let modules = glob.sync(`modules/**/*`);
let dataFiles = glob.sync(`data/*`);

client.data = {};
for (const file of dataFiles) {	
	if(!file.endsWith(".json")) continue;	
	const data = require(`./${file}`);

	let path_array = file.split("/");
	let name = path_array[path_array.length - 1].split(".json")[0];
	client.data[name] = data
}

let eventModules = {};
for (const file of modules) {	
	if(!file.endsWith(".js")) continue;
	let path_array = file.split("/");
	let name = path_array[path_array.length - 1].split(".js")[0];

	const jsObject;
	try{
		jsObject = require(`./${file}`);
		if(jsObject.reqs){
			async function req(){
				await jsObject.reqs(client, db);
			}
			req();
		}
	}catch(e){
		console.log(`Failed to load ${file}`);
		console.log(e.stack);
		continue;
	}

	switch(name){
		case "commands":
			let commands = jsObject.commands;
			Object.keys(commands).forEach(async commandName => {
				client.commands.set(commandName, commands[commandName]);
				client.commands.get(commandName).type = path_array[path_array.length-2];
				if(command.alias){
					command.alias.forEach(alias => {
						client.commands.set(alias, commands[commandName])
					})		
				}	
			})
			break;

		case "events":
			let events = jsObject.events;
			Object.keys(events).forEach(eventName => {
				if(!eventModules[eventName]) eventModules[eventName] = [];
				eventModules[eventName].push(events[eventName])
			})
			break;
	}	
}

Object.keys(eventModules).forEach(eventName => {
	client.on(eventName, (...args) => {
		eventModules[eventName].forEach(func => {
			func(client, db, ...args);
		})
	})
})

/*client.on('ready', async () => {
	await util.log(client,'I am ready!');	
});*/

client.on('message', async message => {
	if(!message.member) return;
	await util.userCheck(message.author.id,client,db);
	util.exp(message,client, db);
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
		if(await util.permCheck(message, commandName, client, db)){				
			if(command == undefined){command = {}; command.type = param[0].toLowerCase()};
			if (!client.commands.has(command.type)) return;				
			client.commands.get(command.type).execute(client, message, param, db);
		}
	}
});

process.on('unhandledRejection', err => {if(err.message != "Unknown User") util.log(client,err.stack)});
client.login(client.data.tokens.akira);