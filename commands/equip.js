var fs = require("fs");
var util = require("../utilities.js");
var json = require('jsonfile');

module.exports = {
    desc:"This is a description",
    alias:["bg"],
    execute(client, message, param){
try{
        var inventory = json.readFileSync("../data/inventory.json");
        var exp = json.readFileSync("../data/exp.json");
        if(exp[message.author.id].badges == undefined) {exp[message.author.id].badges = [];util.save(exp,"exp")}

        if(param.length > 2){
            if(isNaN(param[param.length - 1])) return message.channel.send(`Invalid number`)
             
            var slot = parseInt(param[param.length - 1] - 1);
            var name = param.splice(1,param.length - 2).join(" ").toUpperCase();
                        
            if(!fs.existsSync(`images/badges/${name}.png`)) return message.channel.send(`The badge ${name} doesnt exist. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
            
            if(inventory[message.author.id].badges.includes(name)){
                exp[message.author.id].badges[slot] = name;
                util.save(exp,"exp");
                message.channel.send("New badge applied!")
            }else{
                message.channel.send("Sorry, you dont own this badge ;-;");
            }
        }else{
            message.channel.send("You forgot the name of the badge or the number of the slot. Usage: >equip <name> <slot>");
        }
    }
catch(e){
util.log(client,`${e}
Source: ${__filename.split('/root/bots/')[1]}`)
}
}
}