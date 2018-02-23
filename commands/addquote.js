var Discord = require("discord.js");
var quotes = require("../../data/quotes.json");
var util = require('../utilities.js');

module.exports = {
    desc:"Adds a quote to the featured list. Usage: >addquote <id> <serious>",
    async execute(client, message, param){
        try{
            var color;
            var thumb;
            var snowflake;
            if(param.length == 3 && param[1].toLowerCase() === "deep"){
                color = 0x08457E;
                thumb = "https://raw.githubusercontent.com/rikumax25/akirabot/master/resources/74625-32.png";
                snowflake = param[2];
            }else{
                color = 0x7C00B9;
                thumb = "https://gamefaqs.akamaized.net/faqs/25/74625-32.png";
                snowflake = param[1];
            }
            message.channel.messages.fetch(snowflake).then(function(quote){
                var embed = new Discord.MessageEmbed()
                .setColor(color)
                .setDescription(quote.content + "\nQuote id: " + quotes.length)
                .setTitle("#" + quote.channel.name)
                .setThumbnail(thumb)
                .setAuthor(quote.author.username, quote.author.avatarURL());
                quotes[quotes.length] = {
                    "desc":quote.content,
                    "title":"#" + quote.channel.name,
                    "author":quote.author.username,
                    "thumb":thumb,
                    "color":color,
                    "avatar": quote.author.defaultAvatarURL
                };
                //save line
                await util.save(quotes,"quotes");
                await message.reply(" has recorded your message in the books of history <@" + quote.author.id + ">");
                await message.guild.channels.find("name","memorabilia").send({embed});
                message.delete();
            });
        }catch(e){
            util.log(client,`${e}\nSource: ${__filename.split('/root/bots/')[1]}`)
        }
    }
}