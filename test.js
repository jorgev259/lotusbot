module.exports = function(){
    const Discord = require('discord.js');
    var fs = require("fs");
    const client = new Discord.Client();
    const client2 = new Discord.Client();

    var dotenv = require('dotenv');
    dotenv.load();

    client.on("ready",function(){
        client.guilds.get("289758148175200257").channels.get("361635275170119693").search({
          has:"-image",
        }).then(res => {
           res.results.forEach(function(result){
            client2.guilds.get("289758148175200257").channels.get("361635275170119693").bulkDelete(result);
            })
        })
    })

    client2.login(process.env.discord_token);
    client.login(process.env.chitotoken)
}
