var util = require('../../utilities.js');
var express = require('express');
var app = express();

module.exports = {
    events: {
        async ready(client, db){
            app.get('/members/:guild', function(req, res) {
                let guild = client.guilds.get(req.params.guild);
                if(guild) 
                    res.send(guild.members.size.toString());
                else
                    res.sendStatus(404);
            });

            app.listen(3000, function() {
                util.log(client, 'Request API up and running, sir!');
            });
        }
    }
}