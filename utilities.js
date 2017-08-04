
var fs = require("fs");

var methods = {
	checkalias:function(command){
        if(command.type === "execute"){return command};
        var fs = require('fs');
        var allAlias = JSON.parse(fs.readFileSync('commands.json', 'utf8'));
        var keys = Object.keys(allAlias);
        var i = 0;
        var out = {};
        for(i=0;i<keys.length;i++){
            if(keys[i] == command){
                out.type = allAlias[keys[i]].type;
                out.content = allAlias[keys[i]].content;
                return out;
            }
            if(allAlias[keys[i]].alias){ 
                for(var i2=0; i2<allAlias[keys[i]].alias.length;i2++){
                    if(allAlias[keys[i]].alias[i2] === command){
                        out.type = allAlias[keys[i]].type;
                        out.content = allAlias[keys[i]].content;
                        return out;
                    }
                }
            }
        }
        out.type = "default";
        return out;
    },
};

module.exports = methods;
