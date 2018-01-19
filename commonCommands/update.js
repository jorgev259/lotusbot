var path = require("path");
var util = require('../utilities.js');

module.exports = {
	execute(client, message, param){
		try{
			const git = require('simple-git')(path.resolve("../", client.user.username.toLowerCase()));
			message.delete();

			message.channel.send("Downloading changes.....").then(m=>{
				git.pull((err,res)=>{               
					if(err){
						util.log(client,err);
						return m.edit("Git pull failed!")
					}
					console.log(res);
					if(res.files.length>0){
						m.edit(`Git pull successful!\nModified files: ${res.files.join(" ,")}\nSummary: ${JSON.stringify(res.summary).split("{")[1].split("}")[0]}`).then(returned=>process.exit())
					}else{
						m.edit("Already up to date!");
					}
				})
			})      
		}catch(e){
			util.log(client,`${e}\nSource: ${__filename.split('/root/bots/')[1]}`)
		}
	}
}