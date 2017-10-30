var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];
var reactions = ["rage","thinking","blush","stuck_out_tongue_closed_eyes","heart_eyes"];
var cooldown = {};

var levels = require("../data/levels.json")
var fs = require("fs");
const Discord = require('discord.js');

module.exports = {
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

    exp:function(exp,msg){
        if(cooldown[msg.author.id] == undefined && !msg.author.bot){ //checks if the user is not on cooldown and filters bots out
            if(exp[msg.author.id] == undefined){exp[msg.author.id] = {"lvl":0,"exp":0}}; //if the user is not on exp.json, adds it

            //adds random amount (15-25) of exp to the user
            var randomExp = Math.floor(Math.random() * ((25-15)+1) + 15);
            exp[msg.author.id].exp += randomExp;

            if(exp[msg.author.id].exp > levels[exp[msg.author.id].lvl].exp){ //checks if the user has reached enough exp
                msg.member.removeRole(msg.member.roles.filter(role => role.name.startsWith("["))); //removes past level role
                msg.member.addRole(msg.guild.roles.find("name",`[${exp[msg.author.id].lvl + 1}]`)) //adds new level role

                levels[exp[msg.author.id].lvl].rewards.forEach(function(reward){ //checks every reward
                    switch(reward.type){
                        case "role":
                            msg.member.addRole(msg.guild.roles.find("name",reward.name)); //adds the rewarded role
                            break;
                    }
                })

                exp[msg.author.id].lvl += 1;
            }

            module.exports.save(exp,"exp");

            cooldown[msg.author.id] = true; //sets the user on cooldown and will remove it in 60000 ms (1 minute)
            setTimeout(function(){
                delete cooldown[msg.author.id];
            },60000)
        }
    },

    save:function(data,name){
        fs.writeFile("../data/" + name + ".json", JSON.stringify(data), 'utf-8', function(){});
    },

    log:function(data,log){
        data.guild.channels.find("name","bot-logs").send(new Discord.MessageEmbed().setTimestamp().setDescription(log));
    }
}

