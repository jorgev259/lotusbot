module.exports = {
    events: {
        async guildMemberUpdate(client,db,oldMember,newMember){
            if(oldMember.nickname != newMember.nickname){
                db.run("INSERT OR REPLACE INTO nicks (id,nick) VALUES (?,?)", [newMember.id, newMember.nickname]);
            }
        }
    }
}