var fs = require("fs");
var util = require("../utilities.js");
var json = require('jsonfile');

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var inventory = json.readFileSync("../data/inventory.json");
        var exp = json.readFileSync("../data/exp.json");

        if(param.length > 1){
            var code = param[1].toUpperCase();
            if(fs.existsSync(`../images/backgrounds/${code}.png`) || code=="DEFAULT"){
                if(inventory[message.author.id][`bg${code}`] || code=="DEFAULT"){
                    exp[message.author.id].bg = code;
                    util.save(exp,"exp");
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
    }
}