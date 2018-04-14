var fs = require("fs");
var util = require('../../utilities.js');

module.exports = {
    desc:"Empties a badge slot from your profile. >unequip <1-9>",
    async execute(client, message, param, db){        
        if(param.length <= 1) return message.channel.send("You forgot the number of slot you want to empty. Usage: >unequip <slot>");
        if(isNaN(param[1])) return message.channel.send(`Invalid number`) 

        var slot = parseInt(param[1]) - 1;
        await db.run(`DELETE FROM badges WHERE EXISTS (SELECT * FROM badges WHERE id = ${message.author.id} AND number=${slot});`)
        message.channel.send(`The slot number ${slot + 1} has been emptied!`);                    
    }
}
