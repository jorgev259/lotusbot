const Canvas = require('canvas');
const Discord = require('discord.js');
var json = require('jsonfile');
var fs = require('fs');
const download = require('image-downloader');

var levels = require("../../data/levels.json")

Canvas.registerFont("font/BebasNeue Bold.ttf",{family:"BebasNeue Bold"})
Canvas.registerFont("font/Mizo Arial.ttf",{family:"Mizo Arial"})

module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        var exp = json.readFileSync("../data/exp.json");
        var pfMember;
        if(message.mentions.members.size > 0){
            pfMember = message.mentions.members.first()
        }else{
            pfMember = message.member;
        }
        var bg = "";
        if(exp[pfMember.id] == undefined || exp[pfMember.id].bg == undefined){
            bg = "images/backgrounds/DEFAULT.png";
        }else{
            bg = `images/backgrounds/${exp[pfMember.id].bg}.png`;
        }
        var nick = pfMember.nickname.split(" ");
        nick.pop();

        const options = {
            url: pfMember.user.displayAvatarURL({"format":"png"}),
            dest: `../temp/${pfMember.id}.png`
        }

        download.image(options).then(({ filename, image }) => {
            var id = pfMember.id
            var profile = Canvas.createCanvas(1059,787);
            var pfCtx = profile.getContext('2d');
            var img = new Canvas.Image();

            img.src = fs.readFileSync(bg);
            pfCtx.drawImage(img,0,0);

            img.src= fs.readFileSync("images/profile.png");
            pfCtx.drawImage(img,0,0);

            img.src= fs.readFileSync(`./../temp/${id}.png`);
            pfCtx.drawImage(img,72,296,195,195);
            fs.unlink(`../temp/${id}.png`)

            img.src= fs.readFileSync("images/bar1.png");
            var percent;
            if(exp[id].lvl > 0) {
                percent = ((exp[id].exp - levels[exp[id].lvl -1].exp) / (levels[exp[id].lvl].exp - levels[exp[id].lvl -1].exp))
            }else{
                percent = ((exp[id].exp) / (levels[0].exp))
            }
            pfCtx.drawImage(img,312,461,(435*percent),26);

            pfCtx.font = '180px "BebasNeue Bold"';
            pfCtx.fillStyle = '#000000';
            pfCtx.fillText(exp[id].lvl, 90,645);

            pfCtx.font = '30px "Mizo Arial"';
            pfCtx.fillStyle = '#ffffff';
            pfCtx.fillText(nick.join(" "), 353,440);
            pfCtx.fillText(exp[id].exp.toString() + " / " + levels[exp[id].lvl].exp, 506,530);
            pfCtx.fillText(exp[id].money, 506,568);

            message.channel.send(new Discord.MessageAttachment(profile.toBuffer(),"profile.png"))
        })
    }
}