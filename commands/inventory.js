var json = require("jsonfile");
const Discord = require('discord.js');

module.exports = {
    desc:"Displays bought items",
    execute(client, message, param){
        var inventory = json.readFileSync("../data/inventory.json");
        var exp = json.readFileSync("../data/exp.json");
        var items = json.readFileSync("../shiro/Storage/items.json");

        var inventoryEmbed = new MessageEmbed();
        var bgs = "";
        inventory[message.author.id].bgs.forEach(element => {
            if(element == exp[message.author.id].bg){
                bgs+=`**${element}**\n`
            }else{
                bgs+=`${element}\n`
            }
        });
    }
}