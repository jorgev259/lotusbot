var sqlite = require("sqlite");

module.exports = {
    alias:["money"],
    desc:"This is a description",
    async execute(client, message, param, db){
        var { money } = await db.get(`SELECT money FROM exp WHERE id = ${message.author.id}`);
        var embed = {
            title: `**Account Balance:** ${money} 💴`,
            timestamp: message.createdTimestamp, 
            author: {
                name: message.member.displayName,
                icon_url: message.author.displayAvatarURL(),
            },
            color: message.member.displayColor
        }

        /*if (message.member.roles.exists("name", "Staff Team")) {   
            embed.color= 16723473, 
            embed.footer= {
                icon_url: "https://i.imgur.com/nIiVFxH.png",
                text: "Fandom Bank (Staff Member 🔰)",
            }
        }
        //XXXXXXXX BALANCE FOR PATRONS------      
        else if (message.member.roles.exists("name", "✨ Patreons")) {    
                embed.color= 16766720,               
                embed.footer= {
                    icon_url: "https://i.imgur.com/e6GVMzo.png",
                    text: "Fandom Bank (Patron ✨)",
                }  
        }
        //XXXXXXXX BALANCE FOR VETERANS------         
        else if (message.member.roles.exists("name", "🍙 - Veterans")) {
                embed.color= 6384383,              
                embed.footer= {
                    icon_url: "https://i.imgur.com/h0UM6Nj.png",
                    text: "Fandom Bank (Veteran 🍙)",
                } 
        }
        //XXXXXXXX BALANCE FOR MEMBERS------                   
        else if (message.member.roles.exists("name", "🍧 - Members")) { 
                embed.color= 16723473,               
                embed.footer= {
                    icon_url: "https://i.imgur.com/0df5BYX.png",
                    text: "Fandom Bank (Member 🍧)",
                }
        }    
        //XXXXXXXX BALANCE FOR CUSTOMERS------                       
        else if (message.member.roles.exists("name", "☕ - Customers")) {
                embed.color= 14246399,             
                embed.footer= {
                icon_url: "https://i.imgur.com/T6XEiI2.png",
                text: "Fandom Bank (Customer ☕)",
                }
        }     
        else {    
            return message.channel.send(`**You are missing a role - please contact the staff**`)
        };*/
        
        message.channel.send({embed:embed});
    }
}
