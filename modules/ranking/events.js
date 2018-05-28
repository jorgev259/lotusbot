var util = require('../../utilities.js');

module.exports = {
    async reqs(client,db){
        await db.run(`CREATE TABLE IF NOT EXISTS exp (id TEXT, color TEXT, exp, lastDaily TEXT, lvl INT, money INT, rank INT, bg TEXT, UNIQUE(id));`);
    },
    events: {
        async ready(client, db){
            let colorRoles = {}; //colorRoles[color][rank]
            let groupRoles = {}; //groupRoles[color]

            let guild = client.guilds.get("289758148175200257");
            if(!guild) return;
            let roles = guild.roles.filter(role  => role.position < guild.roles.find(role => role.name == '//Colors').position && role.position > guild.roles.find(role => role.name == '//End Colors').position).sort(function (a, b) {return a.position- b.position})
            let roles2 = guild.roles.filter(role  => role.position < guild.roles.find(role => role.name == '//Groups').position && role.position > guild.roles.find(role => role.name == '//End Groups').position && role.name != "- - - - - - - - - -").sort(function (a, b) {return a.position- b.position})
            let section = [];
            roles.forEach(role => {	
                if(role.name == "- - - - - - - - - -"){
                    colorRoles[colors[Object.keys(colorRoles).length]] = section;
                    section = [];
                }else{
                    section.push(role.id);
                }
            })
            colorRoles[colors[Object.keys(colorRoles).length]] = section;

            roles2.forEach(role => {	
                groupRoles[colors[Object.keys(groupRoles).length]] = role.id;
            })

            client.data.colorRoles = colorRoles;
            client.data.groupRoles = groupRoles;
        },

        async guildMemberAdd(client,db,member){
            await util.userCheck(member.id,client,db)
            var name = member.user.username;
            if(client.data.nicks[member.id] == undefined) {
                member.setNickname(name + " ☕");
                await db.run("INSERT OR REPLACE INTO nicks (id,nick) VALUES (?,?)", [member.id, name + " ☕"]);
            }else{
                member.setNickname(client.data.nicks[member.id],"Locked nickname");
            }
        }
    }
}