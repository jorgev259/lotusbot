var path = require("path");
const git = require('simple-git')(path.resolve(__dirname,"../"));

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        message.delete();

        message.channel.send("Downloading changes.....").then(m=>{
            git.pull().then(()=>{
                m.edit("Git pull successful!");
            })
        })      
    }
}