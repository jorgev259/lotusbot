module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        message.channel.bulkDelete(parseInt(param[1]) + 1);
    }
}
