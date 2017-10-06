const Discord = require('discord.js');
const client = new Discord.Client();

var config = require("../data/config.json");

client.login(config.akkoToken);
