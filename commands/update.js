var path = require("path");
const git = require('simple-git')(path.resolve(__dirname,"../"));

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        git.pull().then((res)=>{
            console.log("err2123123");
            console.log(res);
        })
    }
}