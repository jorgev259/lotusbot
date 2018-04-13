var util = require('../../utilities.js');

module.exports = {
    desc:"Adds a new command to Akira. Usage: >add <type> <name> <link>",
    async execute(client, message, param, db){
        if(message.mentions.members.size == 0) return message.channel.send("Please mention an user");
        message.mentions.members.forEach(async member => await util.userCheck(member.id, client, db));
    }
}
