var fs = require("fs");
var util = require('../../utilities.js');
var glob = require('glob');

const Canvas = require('canvas');
var { MessageAttachment } = require('discord.js');
const download = require('image-downloader');

Canvas.registerFont("font/BebasNeue Bold.ttf",{family:"BebasNeue Bold"})
Canvas.registerFont("font/Mizo Arial.ttf",{family:"Mizo Arial"})

module.exports = {
    commands: {
        background: {
            desc:"Equips a background to your profile. Usage: >bg <code>",
            alias:["bg"],
            async execute(client, message, param, db){
                if(param.length > 1){
                    var code = param[1].toUpperCase();
                    if(glob.sync(`images/backgrounds/**/${code}*`).length || code=="DEFAULT"){
                        var bgs = (await db.all(`SELECT item from inventory WHERE id=${message.author.id} AND type="bgs"`)).map(e=>e.item);

                        if(bgs.includes(code) || code=="DEFAULT"){
                            await db.run(`UPDATE exp SET bg = "${code}" WHERE id = ${message.author.id}`);
                            message.channel.send("New background applied!")
                        }else{
                            message.channel.send("Sorry, you dont own this background ;-;");
                        }
                    }else{
                        message.channel.send(`The background code ${code} doesnt exist. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                    }
                }else{
                    message.channel.send("You forgot the background's code. Usage: >background <code>");
                }
            }
        },

        equip: {
            desc:"Equips a badge in your profile. Usage <badge> <1-9>",
            alias:["badge"],
            async execute(client, message, param, db){
                if(param.length <= 2) return message.channel.send("You forgot the name of the badge or the number of the slot. Usage: >equip <name> <slot>");
                if(isNaN(param[param.length - 1])) return message.channel.send(`Invalid number`)
                        
                var slot = parseInt(param[param.length - 1])  - 1;
                var name = param.splice(1,param.length - 2).join(" ").toUpperCase();
                                
                if(!glob.sync(`images/badges/**/${name}*`).length) return message.channel.send(`The badge ${name} doesnt exist. Check https://www.fandomcircle.com/shop-1#PROFILES for more info`)
                
                let badgesInv = (await db.all(`SELECT item from inventory WHERE id=${message.author.id} AND type="badges"`)).map(e=>e.item);
                let badges = (await db.all(`SELECT item from badges WHERE id=${message.author.id}`)).map(e=>e.item);

                if(!badgesInv.includes(name)) return message.channel.send("Sorry, you dont own this badge ;-;");
                if((await db.all(`SELECT item from badges WHERE id=${message.author.id} AND number=${slot}`)).length) return message.channel.send("There's already a badge on this slot");
                if(badges.includes(name)) return message.channel.send('You already have that badge equipped');
                            
                await db.run("INSERT OR REPLACE INTO badges (id,number,item) VALUES (?,?,?)", [message.author.id,slot,name]);
                message.channel.send("New badge applied!");
            }
        },

        unequip: {
            desc:"Empties a badge slot from your profile. >unequip <1-9>",
            async execute(client, message, param, db){        
                if(param.length <= 1) return message.channel.send("You forgot the number of slot you want to empty. Usage: >unequip <slot>");
                if(isNaN(param[1])) return message.channel.send(`Invalid number`) 

                var slot = parseInt(param[1]) - 1;
                await db.run(`DELETE FROM badges WHERE id = ${message.author.id} AND number=${slot};`)
                message.channel.send(`The slot number ${slot + 1} has been emptied!`);                    
            }
        },

        profile: {
            desc:"Shows your profile (or other user's if tagged)",
            alias:["balance"],
            async execute(client, message, param, db){
                var pfMember
                if(message.mentions.members.size > 0){
                    pfMember = message.mentions.members.first()
                }else{
                    pfMember = message.member;
                }

                var exp = await db.get(`SELECT * FROM exp WHERE id = ${pfMember.id}`);
                var levels = client.data.levels;

                var bg = "";
                if(exp.bg == undefined){
                    bg = "images/backgrounds/DEFAULT.png";
                }else{
                    bg = glob.sync(`images/backgrounds/**/${exp.bg}*`)[0];
                }
                var nick = pfMember.nickname.split(" ");
                nick.pop();

                const options = {
                    url: pfMember.user.displayAvatarURL({"format":"png"}),
                    dest: `../temp/${pfMember.id}.png`
                }

                download.image(options).then(async ({ filename, image }) => {
                    var id = pfMember.id
                    var profile = Canvas.createCanvas(1059,787);
                    var pfCtx = profile.getContext('2d');
                    var img = new Canvas.Image();

                    img.src = fs.readFileSync(bg);
                    pfCtx.drawImage(img,0,0);

                    img.src= fs.readFileSync("images/profile.png"); 
                    pfCtx.drawImage(img,0,0);

                    img.src= image;
                    pfCtx.drawImage(img,72,296,195,195);
                    fs.unlink(`../temp/${id}.png`)

                    img.src= fs.readFileSync("images/bar1.png");
                    var percent;
                    if(exp.lvl > 1) {
                        percent = ((exp.exp - levels[exp.lvl -1].exp) / (levels[exp.lvl].exp - levels[exp.lvl -1].exp))
                    }else{
                        percent = ((exp.exp) / (levels[0].exp))                
                    }    
                    pfCtx.fillStyle = 'white';
                    pfCtx.fillRect(748 - (435*Math.abs(percent)), 600, (435*Math.abs(percent)), 28);           

                    img.src=fs.readFileSync(`images/numbers/${exp.lvl}.png`);
                    pfCtx.drawImage(img,80,500);

                    pfCtx.font = '30px "Mizo Arial"';
                    pfCtx.fillStyle = '#ffffff';
                    pfCtx.fillText(nick.join(" "), 353,570);
                    pfCtx.fillText(exp.exp.toString() + " / " + levels[exp.lvl - 1].exp, 516,670);
                    pfCtx.fillText(exp.money, 516,708);

                    let badges = (await db.all(`SELECT item,number from badges WHERE id=${id}`));
                    if(badges.length > 0){
                        badges.forEach(badge => {
                            var row = 0;
                            if(badge.number > 2) row += Math.floor(badge.number/3);
                            var column = badge.number - (row*3)
                            var y = 430 + (75*row);
                            var x = 775 + (80*column);
                            
                            img.src=fs.readFileSync(glob.sync(`images/badges/**/*${badge.item}*`)[0]);
                            pfCtx.drawImage(img,x,y,70,70);
                        })
                    }
                    message.channel.send(new MessageAttachment(profile.toBuffer(),"profile.png"))
                })
            }
        }
    }
}