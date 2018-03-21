module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        message.channel.overwritePermissions(message.guild.roles.get(message.guild.id),{SEND_MESSAGES: false} ,"EVERYBODY PANIC").then(ch=>{
            ch.send("This channel has been temporarily blocked")
        })
}
}
