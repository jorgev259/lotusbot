function params(param){
    return param.slice(1,param.length).join(" ");
};

module.exports = {
    async execute(client, message, param){
        let commands = client.data.commands;
        let command = commands[param[0].toLowerCase()];
        let hooks = (await message.channel.fetchWebhooks()).filter(h => h.name == "simple");

        let hook;
        if(hooks.size == 0) hook = await message.channel.createWebhook("simple", { avatar: message.author.displayAvatarURL()});  
        else{
            hook = hooks.first();
            await hook.edit({'avatar': message.author.displayAvatarURL()})
        } 
        message.delete();     
        hook.sendSlackMessage({
            'username': ' ',
            'text': eval("`" + command.content + "`")
        }).catch(console.error);   
    }
}
