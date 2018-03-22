var fs = require("fs");
var util = require('../../utilities.js');

module.exports = {
    desc:"Empties a badge slot from your profile. >unequip <1-9>",
    async execute(client, message, param){
            if(client.data.exp[message.author.id].badges == undefined) {client.data.exp[message.author.id].badges = [];util.save(client.data.exp,"exp")}

            if(param.length > 1){
                if(isNaN(param[1])) return message.channel.send(`Invalid number`) 

                var slot = parseInt(param[1]);
                if(client.data.exp[message.author.id].badges[slot - 1]){
                    client.data.exp[message.author.id].badges[slot - 1] = undefined;
                    await util.save(client.data.exp,"exp");
                    message.channel.send(`The slot number ${slot} has been emptied!`)                    
                }else{
                    message.channel.send(`The slot number ${slot} has nothing equipped on it!`)
                }
            }else{
                message.channel.send("You forgot the number of slot you want to empty. Usage: >unequip <slot>");
            }
    }
}
