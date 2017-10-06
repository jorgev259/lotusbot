var reactions = ["rage","thinking","blush","stuck_out_tongue_closed_eyes","heart_eyes"];
var fs = require("fs");

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
            console.log(reactions[number]);
            poll.react(poll.guild.emojis.find("name",reactions[number])).then(function(){
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
        fs.truncate("../data/" + name + ".json", 0, function() {
            fs.writeFile("../data/" + name + ".json", JSON.stringify(data), function (err) {
                if (err) {
                    return console.log("Error writing file: " + err);
                }
            });
        });
    }
};

