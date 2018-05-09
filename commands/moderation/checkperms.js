module.exports = {
    desc: "Shows the permissions set for the mentioned command",
    async execute(client, message, param, db){
        let dbPerms = await db.all(`SELECT item,type FROM perms WHERE command='${param[0].toLowerCase()}'`)
		let perms = {channel: [], role:[], user:[]};
		dbPerms.forEach(element => {
			perms[element.type].push(element.item);
        })
        message.channel.send(JSON.stringify(perms));
    }
}
