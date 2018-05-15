const moment = require('moment');
var util = require('../../utilities.js');

module.exports = {
    events: {
        async ready (client,db){
            if(moment().isSame(client.data.info.lastPFP,'day')){
                var nextDay = moment(client.data.info.lastPFP).add(1, 'day').format('YYYY-MM-DD');
        
                util.log(client, `Next profile pic change and backups scheduled to happen ${moment().to(nextDay)}`)
                setTimeout(util.swapPFP, moment(nextDay).diff(moment()), client)
            }else{
                util.log(client, `Starting profile change`)
                util.swapPFP(client);
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

    client.guilds.get("289758148175200257").setIcon(`../../images/serverpics/${day}.${month}.png`)
    .then(updated => {
        client.data.info.lastPFP = moment().format('YYYY-MM-DD');
        util.save(client.data.info, 'info');

        var nextDay = moment().add(1, 'day').format('YYYY-MM-DD');
        setTimeout(util.swapPFP, moment(nextDay).diff(moment()), client)
        util.log(client, `Next profile pic change and backup scheduled to happen ${moment().to(nextDay)}`)
    })
}