module.exports = {
    events:{
        async guildMemberAdd(client,db,member){
            member.guild.channels.find(channel => channel.name=="│main-lounge").send(`Welcome to Fandom Circle, ${member}! Have Fun`);
        }
    }    
}