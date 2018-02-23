var fs = require("fs");
var util = require("../utilities.js");
var json = require('jsonfile');

module.exports = {
    desc:"Empties a badge slot from your profile. >unequip <1-9>",
    execute(client, message, param){
        try{
            var inventory = json.readFileSync("../data/inventory.json");
            var exp = json.readFileSync("../data/exp.json");
            if(exp[message.author.id].badges == undefined) {exp[message.author.id].badges = [];util.save(exp,"exp")}

            if(param.length > 1){
                if(isNaN(param[1])) return message.channel.send(`Invalid number`) 

                var slot = parseInt(param[1]);
                if(exp[message.author.id].badges[slot - 1]){
                    exp[message.author.id].badges[slot - 1] = undefined;
                    await util.save(exp,"exp");
                    message.channel.send(`The slot number ${slot} has been emptied!`)                    
                }else{
                    message.channel.send(`The slot number ${slot} has nothing equipped on it!`)
                }
            }else{
                message.channel.send("You forgot the number of slot you want to empty. Usage: >unequip <slot>");
            }
        }catch(e){
            util.log(client,`${e}\nSource: ${__filename.split('/root/bots/')[1]}`)
        }
    }
}