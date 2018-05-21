var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];
var reactions = ["390223211662540800","390223209930424321","390223211637243905","390223211616534577","390223211456888835","390223210240540683"];
var cooldown = {};
var colors = ["pink","d-blue","purple","l-blue","green","red"];
const Discord = require('discord.js');

var moment = require("moment");
var random = require("random-number-csprng");
var fs = require("fs");
var zipdir = require('zip-dir');

module.exports = {
	async permCheck(message, commandName, client, db){
		let dbPerms = await db.all(`SELECT item,type FROM perms WHERE command='${commandName}'`)
		let perms = {channel: [], role:[], user:[]};
		dbPerms.forEach(element => {
			perms[element.type].push(element.item);
		})
		if(dbPerms.length == 0 || message.member.roles.exists("name","🍬") ||  message.member.roles.exists("name","🍬 Master Developer")) return true;
		var allowedChannel = true;
		var allowed = false;

		if(perms.channel.length>0){
			allowedChannel = false;
			if(perms.channel.includes(message.channel.name)) allowedChannel = true;
		}
		if(allowedChannel){
			if(perms.role.length==0 && perms.user.length==0){return true};

			if(perms.role.length>0){
				for(var i=0;i<perms.role.length;i++){
					var role = message.member.guild.roles.find("name", perms.role[i]);
					if(role != null && message.member.roles.has(role.id)){
						return true;
						i=perms.role.length;
					}
				}
			}

			if(!allowed && perms.user.length>0){
				for(var i=0;i<perms.user.length;i++){
					if(perms.user[i] == message.author.id){
						return true;
						i=perms.user.length;
					}
				}
			}

		}
		return false;
	},

	async userCheck(id,client,db){
		let member = await client.guilds.get("289758148175200257").members.fetch(id);
		if(member.user.bot) return;

		await db.run("INSERT OR IGNORE INTO exp (id,color,rank,lvl,exp,money,lastDaily,bg) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [member.id, colors[await random(0,colors.length-1)], 0, 1, 0, 0, "Not Collected", "DEFAULT"])		
		const userInfo = await db.get(`SELECT lvl,color,rank FROM exp WHERE id = ${member.id}`);
		
		let allRoles = ['436590073568559104', '441580169258598401', '436590072939282432', '435805052259794944', '435801059361947648', '435805052259794944', '435803522659778562' ];
		var rankRoles = member.roles.filter(role => role.name.startsWith('['));
		if (rankRoles.size>1) await member.roles.remove(rankRoles);
			
		allRoles.push(client.guilds.get("289758148175200257").roles.find("name",`[${userInfo.lvl}]`).id, client.data.colorRoles[userInfo.color][userInfo.rank], client.data.groupRoles[userInfo.color]);
		let roles = allRoles.filter(id => !member.roles.has(id))
		await member.roles.add(roles,"User join");
	},

	react:function(msg){
		reactions.forEach(reaction => {
			msg.react(reaction);
		})
	},

	/*findEmoji:function(emoji){
        for(var i=0;i<10;i++){
            if(reactions[i]==emoji){
                return i+1;
            }
        }
    },*/

	async save(data,name){
		await fs.writeFile("data/" + name + ".json", JSON.stringify(data, null, 4));
	},


	log:function(client,log){
		console.log(log);
		if(client != null && client.channels.size>0 && client.readyAt != null){			
			client.channels.find("name","bot-logs").send({embed:new Discord.MessageEmbed().setTimestamp().setDescription(log)});
		}
	}
}

