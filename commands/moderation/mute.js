var util = require('../../utilities.js');

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        if(message.mentions.members.size == 0){
            message.channel.send("User to mute not mentioned");
            return;
        }

        var time;
        var reason = param.slice(3);
        if(isNaN(parseInt(param[2]))){
            time = 0
            reason = param.slice(2);
        }
        message.mentions.members.first().roles.add([message.guild.roles.find("name","Muted")]).then(member=>{
            message.channel.send(`${member.nickname || member.user.username} has been muted.`)
            if(time>0){
                setTimeout(function(memb,msg){
                    if(memb.roles.exists("name","Muted")){
                        memb.roles.remove(msg.guild.roles.find("name","Muted"));
                    }
                },time*60000,member,message)
            }
        })
}
}
