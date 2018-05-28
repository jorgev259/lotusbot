module.exports = {
    events:{
        async message(client,db,msg){
            if(msg.channel.name == "akira" && msg.mentions.channels.size>0){
                client.channels.resolve(msg.mentions.channels.first()).send(msg.content.split(msg.mentions.channels.first()).join(""));
            }
        }
    }   
}