module.exports = {
    desc:"This is a description",
    execute(client, message, param){
try{
        console.log("example");
    }
catch(e){
util.log(client,`${e}
Source: ${__filename.split('/root/bots/')[1]}`)
}
}
}