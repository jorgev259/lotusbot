var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];
var reactions = ["rage","thinking","blush","stuck_out_tongue_closed_eyes","heart_eyes"];
var fs = require("fs");
const Discord = require('discord.js');

module.exports = {
    checkalias:function(command, collection, callback){
        var fs = require('fs');
        collection.find({"name":command},function(err,result){
            if(result.length == 0){
                callback(null,{
                    "type":"default",
                    "perms":[]
                })
            }else{
                callback(null,result[0]);
            }

        });
    },

    react:function(number,limit,poll){
        if(number<limit){
            poll.react(poll.guild.emojis.find("name",reactionNumbers[number])).then(function(){
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

    save:function(data,name){
        fs.writeFile("../data/" + name + ".json", JSON.stringify(data), 'utf-8', function(){});
    },

    log:function(data,log){
        data.guild.channels.find("name","bot-logs").send(new Discord.MessageEmbed().setTimestamp().setDescription(log));
    }
}

