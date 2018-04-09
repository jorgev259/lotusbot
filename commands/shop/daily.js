const moment = require('moment');
var sql = require("sqlite");
var util = require("../../utilities.js");

module.exports = {
    desc:"This is a description",
    async execute(client, message, param){
        const db = await sql.open("./database.sqlite");
        var userInfo = await db.get(`SELECT money,lastDaily FROM exp WHERE id = ${msg.author.id}`);

        var embed = {
            timestamp: message.createdTimestamp, 
            author: {
                name: message.author.displayName,
                icon_url: message.author.displayAvatarURL(),               
            },
            footer:{

            }
        }

        if(userInfo.lastDaily == "Not Collected" || moment.duration(moment().diff(moment(userInfo.lastDaily,"YYYY-MM-DD kk:mm"))).asHours() >= 24){
            userInfo.money += 2000
            await db.run(`UPDATE exp SET money = ${userInfo.money} WHERE id = ${msg.author.id}`);
            await db.run(`UPDATE exp SET lastDaily = ${moment().format("YYYY-MM-DD kk:mm")} WHERE id = ${msg.author.id}`);
            
            embed.fields= [{
                name: "Daily collection",
                value: `**You got 💴 2000! New Balance:** ${userInfo.money}`
            }]
            embed.color= 3446302
            embed.footer.icon_url= "https://i.imgur.com/OWk7t7b.png"
        }else{ 
            embed.footer.icon_url= "https://i.imgur.com/6zXSNu5.png"
            embed.color= 0                                                              
            embed.title= `**You already collected your daily reward! Collect your next reward** in ${24 - Math.floor(moment.duration(moment().diff(moment(userInfo.lastDaily,"YYYY-MM-DD kk:mm"))).asHours())} hours.`;                     
        }

        return message.channel.send({embed:embed})

        /*//XXXXXXXX BALANCE FOR STAFF MEMBERS------             
        if (message.member.roles.find("name", "Staff Team")) {                          
            embed.footer.text = "Fandom Bank (Staff Member 🔰)"
            return message.channel.send({embed:embed})                 
        }
        //XXXXXXXX BALANCE FOR PATRONS-----              
        else if (message.member.roles.find("name", "✨ Patreons")) { 
            embed.footer.text = "Fandom Bank (Patron ✨)"
            return message.channel.send({embed:embed})
        }
        //XXXXXXXX BALANCE FOR VETERANS------                 
        else if (message.member.roles.find("name", "🍙 - Veterans")) {                
            embed.footer.text = "Fandom Bank (Veteran 🍙)"
                return message.channel.send({embed:embed})
            }
        //XXXXXXXX BALANCE FOR MEMBERS------                  
        else if (message.member.roles.find("name", "🍧 - Members")) {               
            embed.footer.text = "Fandom Bank (Member 🍧)"
                return message.channel.send({embed:embed})
        }    
        //XXXXXXXX BALANCE FOR STAFF CUSTOMERS-----                                  
        else if (message.member.roles.find("name", "☕ - Customers")) {
            embed.footer.text = "Fandom Bank (Customer ☕)"
            return message.channel.send({embed:embed})
        }else {
            return message.channel.send(`**You are missing a role - please contact the staff**`)
        };*/
    }
}
