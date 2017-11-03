var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];
var reactions = ["rage","thinking","blush","stuck_out_tongue_closed_eyes","heart_eyes"];
var emojis = ["☕","🍜","🍰","🍪"];
var cooldown = {};

var levels = require("../data/levels.json");
var perms = require("../data/perms.json");
var nicks = require("../data/nicks.json");
var fs = require("fs");
const Discord = require('discord.js');

module.exports = {
    permCheck:function(message, commandName){
        if(perms[commandName] == undefined){return true}
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

    react:function(number,limit,poll){
        if(number<limit){
            poll.react(reactionNumbers[number]).then(function(){
                module.exports.react(number+1,limit,poll);
            })
        };
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
        return text.split(emojis[0])[0].split(emojis[1])[0].split(emojis[2])[0].split(emojis[3])[0];
    },

    exp:function(exp,msg){
        if(cooldown[msg.author.id] == undefined && !msg.author.bot){ //checks if the user is not on cooldown and filters bots out
            if(exp[msg.author.id] == undefined){
                exp[msg.author.id] = {"lvl":0,"exp":0}
                msg.member.addRole(msg.member.guild.roles.find("name",`[${exp[msg.member.id].lvl}]`));
            }; //if the user is not on exp.json, adds it

            //adds random amount (15-25) of exp to the user
            var randomExp = Math.floor(Math.random() * ((15-8)+1) + 8);
            exp[msg.author.id].exp += randomExp;

            if(exp[msg.author.id].exp > levels[exp[msg.author.id].lvl].exp){ //checks if the user has reached enough exp
                var levelroles = msg.member.roles.filter(r=>r.name.startsWith("[")); //finds all roles that start with [
                if(levelroles.size==1){
                    msg.member.removeRole(levelroles.first()); //removes current lvl role
                }else if(levelroles.size>1){
                    msg.member.removeRoles(levelroles); //removes all lvl roles
                }

                msg.member.addRole(msg.guild.roles.find("name",`[${exp[msg.author.id].lvl + 1}]`)) //adds new level role

                if(levels[exp[msg.author.id].lvl].rewards != undefined){
                    levels[exp[msg.author.id].lvl].rewards.forEach(function(reward){ //checks every reward
                        switch(reward.type){
                            case "role":
                                if(!msg.member.nickname.endsWith("🔰")){
                                    msg.member.addRole(msg.guild.roles.find("name",reward.name)); //adds the rewarded role

                                    var newNick = module.exports.stripEmoji(msg.member.nickname) + " " + reward.name.split(" ")[0];
                                    msg.member.setNickname(newNick);
                                    nicks[member.id] = newNick;
                                    utils.save(nicks,"nicks");
                                }
                                break;
                        }
                    })
                }
                exp[msg.author.id].lvl += 1;
            }

            module.exports.save(exp,"exp");

            cooldown[msg.author.id] = true; //sets the user on cooldown and will remove it in 60000 ms (1 minute)
            setTimeout(function(){
                delete cooldown[msg.author.id];
            },90000)
        }
    },

    save:function(data,name){
        fs.writeFile("../data/" + name + ".json", JSON.stringify(data), 'utf-8', function(){});
    },

    log:function(data,log){
        data.guild.channels.find("name","bot-logs").send(new Discord.MessageEmbed().setTimestamp().setDescription(log));
    }
}

