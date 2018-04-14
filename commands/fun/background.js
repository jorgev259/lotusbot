var fs = require("fs");
var util = require('../../utilities.js');
var glob = require('glob');

module.exports = {
    desc:"Equips a background to your profile. Usage: >bg <code>",
    alias:["bg"],
    async execute(client, message, param, db){
        if(param.length > 1){
            var code = param[1].toUpperCase();
            if(glob.sync(`images/backgrounds/**/${code}*`).length || code=="DEFAULT"){
                var bgs = (await db.all(`SELECT item from inventory WHERE id=${message.author,id} AND type="bgs"`)).map(e=>e.item);

                if(bgs.includes(code) || code=="DEFAULT"){
                    await db.run(`UPDATE exp SET bg = "${code}" WHERE id = ${message.author.id}`);
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
