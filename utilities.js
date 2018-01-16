var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];
var reactions = ["390223211662540800","390223209930424321","390223211637243905","390223211616534577","390223211456888835","390223210240540683"];
var emojis = [/(☕)/,/(🍜)/,/(🍰)/,/(🍪)/,/(🔰)/];
var cooldown = {};

const Discord = require('discord.js');
var levels = require("../data/levels.json");

var fs = require("fs");
const writeJsonFile = require('write-json-file');
var json = require("jsonfile");


module.exports = {
	permCheck:function(message, commandName){
		var perms = json.readFileSync("../data/perms.json");

		if(perms[commandName] == undefined || message.member.roles.exists("name","🍬 Admin") ||  message.member.roles.exists("name","name")){return true}
		var allowedChannel = true;
		var allowed = false;

		if(perms[commandName].channel.length>0){
			allowedChannel = false;
			perms[commandName].channel.forEach(function(channel){
				if(channel == message.channel.name){allowedChannel = true}
			})
		}
		if(allowedChannel){
			if(perms[commandName].role.length==0 && perms[commandName].user.length==0){return true};

			if(perms[commandName].role.length>0){
				for(var i=0;i<perms[commandName].role.length;i++){
					var role = message.member.guild.roles.find("name", perms[commandName].role[i]);
					if(role != null && message.member.roles.has(role.id)){
						return true;
						i=perms[commandName].role.length;
					}
				}
			}

			if(!allowed && perms[commandName].user.length>0){
				for(var i=0;i<perms[commandName].user.length;i++){
					if(perms[commandName].user[i] == message.author.id){
						return true;
						i=perms[commandName].user.length;
					}
				}
			}

		}
		return false;
	},

	userCheck:function(id,client){
		var inventory = json.readFileSync("../data/inventory.json");
		var exp = json.readFileSync("../data/exp.json");
		if(inventory[id] == undefined) {
			inventory[id]={badges:[],bgs:[]};
			module.exports.save(inventory,"inventory");
		}
		if(exp[id] == undefined){
			exp[id] = {"lvl":0,"exp":0,"money":0,"lastDaily":"Not Collected"};
			module.exports.save(exp,"exp");		
		}		
		client.guilds.first().members.fetch(id).then(member=>{
			var rankRoles = member.roles.filter(role => role.name.includes(`Rank - ${exp[id].lvl}]`));
			if(rankRoles.size == 0){
				var role = member.guild.roles.filter(role => role.name.includes(`Rank - ${exp[id].lvl}]`)).first();
				member.addRole(role,"Added level role");
			}		
		})		
	},

	reactNumber:function(number,limit,poll){
		if(number<limit){
			poll.react(reactionNumbers[number]).then(function(){
				module.exports.reactNumber(number+1,limit,poll);
			})
		};
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

	emojiCount:function(reactionR,user){
		let count = 0;
		reactionR.message.reactions.forEach(function(reaction){
			if(reaction.users.has(user.id)){
				count++;
			}
		});
		return count
	},

	checkReact:function(reactionR,user,points){
		var count = module.exports.emojiCount(reactionR,user);
		if(count>=2){
			reactionR.remove(user);
		}else{
			points.score += module.exports.findEmoji(reactionR.emoji.name);
			art.save(points);
		}
	},

	stripEmoji:function(text){
		return text.split(emojis[0])[0].split(emojis[1])[0].split(emojis[2])[0].split(emojis[3])[0].split(emojis[4])[0];
	},

	exp:function(msg,client){
		if(cooldown[msg.author.id] == undefined && !msg.author.bot){ //checks if the user is not on cooldown and filters bots out
			module.exports.userCheck(msg.author.id,client)

			var exp = json.readFileSync("../data/exp.json");
			//adds random amount (15-25) of exp to the user
			var randomExp = Math.floor(Math.random() * ((15-8)+1) + 8);
			exp[msg.author.id].exp += randomExp;

			module.exports.save(exp,"exp");

			if(exp[msg.author.id].exp > levels[exp[msg.author.id].lvl].exp){ //checks if the user has reached enough exp
				var levelroles = msg.member.roles.filter(r=>r.name.includes("Rank")) //finds all roles that start with [
				if(levelroles.size==1){
					msg.member.removeRole(levelroles.first(),"Removed current level role"); //removes current lvl role
				}else if(levelroles.size>1){
					msg.member.removeRoles(levelroles,"Removed level roles"); //removes all lvl roles
				}

				exp[msg.author.id].lvl += 1;

				var role=msg.guild.roles.filter(r=>r.name.includes(`Rank - ${exp[msg.author.id].lvl}]`)).first()
				msg.member.addRole(role,"Added new level role") //adds new level role

				exp[msg.author.id].money += exp[msg.author.id].lvl * 500 //adds money reward for leveling up

				module.exports.save(exp,"exp");

				if(levels[exp[msg.author.id].lvl].rewards != undefined){
					levels[exp[msg.author.id].lvl].rewards.forEach(function(reward){ //checks every reward
						switch(reward.type){
							case "role":
								if(!(msg.member.nickname.endsWith("🔰") || msg.member.nickname.endsWith("🍬") || msg.member.nickname.endsWith("🔧") || msg.member.nickname.endsWith("✨") || msg.member.nickname.endsWith("🔖"))){
									var nicks = json.readFileSync("../data/nicks.json");

									msg.member.addRole(msg.guild.roles.find("name",reward.name),"Added reward role"); //adds the rewarded role
									msg.member.removeRole(msg.guild.roles.find("name",reward.remove),"Removed old rank")

									var nick = msg.member.nickname;
									if(msg.member.nickname.endsWith(reward.remove.split(" ")[0])){
										nick = nick.split(reward.remove.split(" ")[0])[0]
									}
									nick += reward.name.split(" ")[0]

									msg.member.setNickname(nick,"Changed nickname emoji");
									nicks[msg.member.id] = nick;
									module.exports.save(nicks,"nicks");
								}
								break;
						}
					})
				}

			}

			cooldown[msg.author.id] = true; //sets the user on cooldown and will remove it in 60000 ms (1 minute)
			setTimeout(function(authorID){
				delete cooldown[authorID];
			},90000,msg.author.id)
		}
	},

	talk:function(client,msg){
		if(msg.mentions.channels.size>0){
			client.channels.resolve(msg.mentions.channels.first()).send(msg.content.split(`<#${msg.mentions.channels.first().id}>`).join(""));
		}
	},

	save:function(data,name){
		return new Promise(function (resolve, reject) {
			writeJsonFile("../data/" + name + ".json", data).then(()=>{
				resolve();
			});
		})
		
	},


	log:function(client,log){
		console.log(log);
		if(client != null && client.channels.size>0 && client.readyAt != null){			
			client.channels.find("name","bot-logs").send({embed:new Discord.MessageEmbed().setTimestamp().setDescription(log)});
		}
	}
}

