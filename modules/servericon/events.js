const moment = require('moment');
var util = require('../../utilities.js');
const fs = require("fs");
var zipdir = require('zip-dir');

module.exports = {
    async reqs(client,db){
        fs.stat('data/info.json', function(err, stat) {
            if(err == null) {
                console.log('File exists');
            }else if(err.code == 'ENOENT') {
                // file does not exist
                client.data.info = {"lastPFP": "Not Changed"}
                fs.writeFileSync('data/info.json', JSON.stringify(client.data.info, null, 4));
            }
        });
    },

    events: {
        async ready (client,db){
            let lastPFP = client.data.info.lastPFP;
            if(lastPFP != "Not Changed" && moment().isSame(lastPFP,'day')){
                var nextDay = moment(lastPFP).add(1, 'day').format('YYYY-MM-DD');
        
                util.log(client, `Next profile pic change and backups scheduled to happen ${moment().to(nextDay)}`)
                setTimeout(swapPFP, moment(nextDay).diff(moment()), client)
            }else{
                util.log(client, `Starting profile change`)
                swapPFP(client);
            }
        },
    }
}

async function swapPFP(client){		  
    let day = moment().date();
    let month = moment().month() + 1;

    zipdir('../data', { saveTo: `./data/${day}.${month}.zip` }, async(err, buffer) => {
        if(err)
            util.log(client, `Failed backup: ${err}`)
        else
            util.log(client, `${day}.${month}.zip created`)
    });

    let guild = client.guilds.get("289758148175200257");
    if(guild) guild.setIcon(`../../images/serverpics/${day}.${month}.png`);

    client.data.info.lastPFP = moment().format('YYYY-MM-DD');
    util.save(client.data.info, 'info');

    var nextDay = moment().add(1, 'day').format('YYYY-MM-DD');
    setTimeout(swapPFP, moment(nextDay).diff(moment()), client)
    util.log(client, `Next profile pic change and backup scheduled to happen ${moment().to(nextDay)}`)
}