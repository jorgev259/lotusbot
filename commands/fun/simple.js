function params(param){
    return param.slice(1,param.length).join(" ");
};
let hook;

module.exports = {
    async execute(client, message, param){
        var commands = client.data.commands;
        var command = commands[param[0].toLowerCase()];
        if(!hook) hook = await message.channel.createWebhook("simple", { avatar: message.author.displayAvatarURL()});  
        else await hook.edit({'avatar': message.author.displayAvatarURL()}) 
        message.delete();     
        hook.sendSlackMessage({
            'username': message.author.username,
            'text': eval("`" + command.content + "`")
        }).catch(console.error);   
    }
}
