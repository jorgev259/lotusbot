var fs = require("fs");
var util = require("../utilities.js");
var json = require('jsonfile');
var glob = require('glob');

module.exports = {
    desc:"Equips a background to your profile. Usage: >bg <code>",
    alias:["bg"],
    async execute(client, message, param){
        try{
            var inventory = json.readFileSync("../data/inventory.json");
            var exp = json.readFileSync("../data/exp.json");

            if(param.length > 1){
                var code = param[1].toUpperCase();
                if(glob.sync(`images/backgrounds/**/${code}*`).length || code=="DEFAULT"){
                    if(inventory[message.author.id].bgs.includes(code) || code=="DEFAULT"){
                        exp[message.author.id].bg = code;
                        await util.save(exp,"exp");
                        message.channel.send("New background applied!")
                    }else{
                        message.channel.send("Sorry, you dont own this background ;-;");
                    }
                }else{
                    message.channel.send(`The background code ${code} doesnt exist. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                }
            }else{
                message.channel.send("You forgot the background's code. Usage: >background <code>");
            }
        }catch(e){
            util.log(client,`${e}\nSource: ${__filename.split('/root/bots/')[1]}`)
        }
    }
}