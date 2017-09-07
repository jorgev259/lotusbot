var reactionNumbers = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣", "🔟"];
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
            poll.react(reactionNumbers[number]).then(function(){
                module.exports.react(number+1,limit,poll);
            })
        };
    }
};

