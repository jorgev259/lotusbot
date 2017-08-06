
var fs = require("fs");

var methods = {
	checkalias:function(command, collection, callback){
        var fs = require('fs');
        var find = collection.find({"name":command},function(err,result){
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
};

module.exports = methods;
