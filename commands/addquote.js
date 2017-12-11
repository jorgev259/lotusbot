var Discord = require("discord.js");
var quotes = require("../../data/quotes.json");
var util = require('../utilities.js');

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
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
            util.save(quotes,"quotes");
            message.reply(" has recorded your message in the books of history <@" + quote.author.id + ">");
            message.delete();
            message.guild.channels.find("name","memorabilia").send({embed});
        });
    }
}