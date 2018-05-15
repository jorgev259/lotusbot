var util = require('../../utilities.js');

module.exports = {
    events: {
        async guildMemberUpdate(client,db,oldMember,newMember){
            if(oldMember.nickname != newMember.nickname){
                db.run("INSERT OR REPLACE INTO nicks (id,nick) VALUES (?,?)", [newMember.id, newMember.nickname]);
            }
        },

        async message(client,db,message){
            if(message.channel.name == "nickname-change" && !message.author.bot){
				var emoji = message.member.nickname.split(" ").pop();

				var namechange = message.content + " " + emoji;
				if(namechange.length < 32){
					client.data.nicks[message.member.id] = namechange;

					await message.member.setNickname(namechange,"Name Change sponsored by Monokuma")
					await util.save(client.data.nicks,"nicks")
					message.delete(namechange);
					message.member.roles.remove([message.guild.roles.find("name","⭕")],"Nickname change")
				}else{
					message.delete();
					message.author.send("That nickname is too long");
				}
			}
        }
    }
}