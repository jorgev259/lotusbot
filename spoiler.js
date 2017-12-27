const SpoilerBot = require('discord-spoiler-bot');
module.exports = function(){  
    let bot = new SpoilerBot({token: (require("../data/tokens.json").akira)});
    bot.connect();
}