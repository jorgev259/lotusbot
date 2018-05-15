const moment = require('moment');
var util = require('../../utilities.js');

module.exports = {
    events: {
        async ready (client,db){
            if(moment().isSame(client.data.info.lastPFP,'day')){
                var nextDay = moment(client.data.info.lastPFP).add(1, 'day').format('YYYY-MM-DD');
        
                util.log(client, `Next profile pic change and backups scheduled to happen ${moment().to(nextDay)}`)
                setTimeout(util.swapPFP, moment(nextDay).diff(moment()), client)
            }else{
                util.log(client, `Starting profile change`)
                util.swapPFP(client);
            }
        },

        async guildMemberAdd(client,db,member){
            await util.userCheck(member.id,client,db)
            var name = member.user.username;
            if(client.data.nicks[member.id] == undefined) {
                member.setNickname(name + " ☕");
                await db.run("INSERT OR REPLACE INTO nicks (id,nick) VALUES (?,?)", [member.id, name + " ☕"]);
            }else{
                member.setNickname(client.data.nicks[member.id],"Locked nickname");
            }
            member.guild.channels.find("name","main-lounge").send(`Welcome to Fandom Circle, ${member}! Have Fun`);
        }
    }
}

