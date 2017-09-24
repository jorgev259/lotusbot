var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];
var fs = require("fs");
var db = require('mongojs')(process.env.mongourl);
var art = db.collection('art-ids')

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
            poll.react(reactionNumbers[number]).then(function(){
                module.exports.react(number+1,limit,poll);
            })
        };
    },

    findEmoji:function(emoji){
        for(var i=0;i<10;i++){
            if(reactionNumbers[i]==emoji){
                return i+1;
            }
        }
    },

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

    startArt:function(){
        art.find({},function(err,result){

        })
    }
};

