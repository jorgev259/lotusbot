module.exports = {
    async guildMemberAdd(client,db,member){
        member.guild.channels.find("name","main-lounge").send(`Welcome to Fandom Circle, ${member}! Have Fun`);
    }
}