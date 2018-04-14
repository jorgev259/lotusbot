var fs = require("fs");
var util = require('../../utilities.js');
var glob = require('glob');

module.exports = {
    desc:"Equips a badge in your profile. Usage <badge> <1-9>",
    alias:["badge"],
    async execute(client, message, param, db){
        if(param.length <= 2) return message.channel.send("You forgot the name of the badge or the number of the slot. Usage: >equip <name> <slot>");
        if(isNaN(param[param.length - 1])) return message.channel.send(`Invalid number`)
                
        var slot = parseInt(param[param.length - 1])  - 1;
        var name = param.splice(1,param.length - 2).join(" ").toUpperCase();
                         
        if(!glob.sync(`images/badges/**/${name}*`).length) return message.channel.send(`The badge ${name} doesnt exist. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
        
        let badgesInv = (await db.all(`SELECT item from inventory WHERE id=${message.author.id} AND type="badges"`)).map(e=>e.item);
        let badges = (await db.all(`SELECT item from badges WHERE id=${message.author.id}`)).map(e=>e.item);

        if(!badgesInv.includes(name)) return message.channel.send("Sorry, you dont own this badge ;-;");
        if(badges.includes(name)) return message.channel.send('You already have that badge equipped');
                    
        await db.run("INSERT OR REPLACE INTO badges (id,number,item) VALUES (?,?,?)", [message.author.id,slot,name]);
        message.channel.send("New badge applied!");
    }
}
