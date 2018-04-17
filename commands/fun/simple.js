function params(param){
    return param.slice(1,param.length).join(" ");
};

module.exports = {
    async execute(client, message, param){
        var commands = client.data.commands;
        var command = commands[param[0].toLowerCase()];

        let hook = await message.channel.createWebhook("simple", { avatar: message.author.displayAvatarURL()});        
        await hook.sendSlackMessage({
            'username': message.member.nickname,
            'text': eval("`" + command.content + "`")
        });
        message.delete();
        hook.delete();
    }
}
