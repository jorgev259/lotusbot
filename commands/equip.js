var fs = require("fs");
var util = require("../utilities.js");
var json = require('jsonfile');
var glob = require('glob');

module.exports = {
    desc:"Equips a badge in your profile. Usage <badge> <1-9>",
    alias:["badge"],
    execute(client, message, param){
            var inventory = json.readFileSync("../data/inventory.json");
            var exp = json.readFileSync("../data/exp.json");
            if(exp[message.author.id].badges == undefined) {exp[message.author.id].badges = [];util.save(exp,"exp")}

            if(param.length > 2){
                if(isNaN(param[param.length - 1])) return message.channel.send(`Invalid number`)
                
                var slot = parseInt(param[param.length - 1] - 1);
                var name = param.splice(1,param.length - 2).join(" ").toUpperCase();
                         
                if(!glob.sync(`images/badges/**/${name}*`).length) return message.channel.send(`The badge ${name} doesnt exist. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                
                if(inventory[message.author.id].badges.includes(name)){
                    exp[message.author.id].badges[slot] = name;
                    message.channel.send("Updating your profile...").then(update=>{
                        util.save(exp,"exp").then(()=>{
                            update.edit("New badge applied!");
                        })                   
                    })               
                }else{
                    message.channel.send("Sorry, you dont own this badge ;-;");
                }
            }else{
                message.channel.send("You forgot the name of the badge or the number of the slot. Usage: >equip <name> <slot>");
            }
    }
}
