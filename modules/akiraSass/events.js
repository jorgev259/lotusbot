module.export = {
    async message(client,db,msg){
        if(msg.mentions.channels.size>0){
			client.channels.resolve(msg.mentions.channels.first()).send(msg.content.split(msg.mentions.channels.first()).join(""));
		}
    }
}