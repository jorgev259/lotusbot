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
try{
        var pfMember
        if(message.mentions.members.size > 0){
            pfMember = message.mentions.members.first()
        }else{
            pfMember = message.member;
        }

        var exp = json.readFileSync("../data/exp.json");

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

            img.src= image;
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

            img.src=fs.readFileSync(`images/numbers/${exp[id].lvl}.png`);
            pfCtx.drawImage(img,80,500);

            pfCtx.font = '30px "Mizo Arial"';
            pfCtx.fillStyle = '#ffffff';
            pfCtx.fillText(nick.join(" "), 353,440);
            pfCtx.fillText(exp[id].exp.toString() + " / " + levels[exp[id].lvl].exp, 506,530);
            pfCtx.fillText(exp[id].money, 506,568);

            if(exp[id].badges && exp[id].badges.length > 0){
                for(var i=0;i<exp[id].badges.length;i++){
                    if(exp[id].badges[i] != undefined){
                        var row = 0;
                        if(i>2) row += Math.floor(i>3);
                        var column = i - (row*3)
                        var y = 430 + (75*row);
                        var x = 775 + (80*column);

                        img.src=fs.readFileSync(`images/badges/${exp[id].badges[i]}.png`);
                        pfCtx.drawImage(img,x,y,70,70);
                    }
                }
            }

            message.channel.send(new Discord.MessageAttachment(profile.toBuffer(),"profile.png"))
        })
    }
};


/*function nitro(client,message,param,pfMember){
    var exp = json.readFileSync("../data/exp.json");

    var bg = "";
    if(exp[pfMember.id] == undefined || exp[pfMember.id].bg == undefined){
        bg = "images/backgrounds/DEFAULT.png";
    }else{
        bg = `images/backgrounds/${exp[pfMember.id].bg}.png`;
    }
    var nick = pfMember.nickname.split(" ");
    nick.pop();

    var encoder = new GIFEncoder(1059,787);
    encoder.createReadStream().pipe(fs.createWriteStream(`../temp/${pfMember.id}.gif`));

    encoder.start();
    encoder.setRepeat(0);   
    encoder.setDelay(100);   

    var id = pfMember.id
    var profile = Canvas.createCanvas(1059,787);
    var pfCtx = profile.getContext('2d');
    var img = new Canvas.Image();

    img.src = fs.readFileSync(bg);
    pfCtx.drawImage(img,0,0);

    img.src= fs.readFileSync("images/profile.png");
    pfCtx.drawImage(img,0,0);

    img.src= fs.readFileSync("images/bar1.png");
    var percent;
    if(exp[id].lvl > 0) {
        percent = ((exp[id].exp - levels[exp[id].lvl -1].exp) / (levels[exp[id].lvl].exp - levels[exp[id].lvl -1].exp))
    }else{
        percent = ((exp[id].exp) / (levels[0].exp))
    }
    pfCtx.drawImage(img,312,461,(435*percent),26);

    img.src=fs.readFileSync(`images/numbers/${exp[id].lvl}.png`);
    pfCtx.drawImage(img,80,500);

    pfCtx.font = '30px "Mizo Arial"';
    pfCtx.fillStyle = '#ffffff';
    pfCtx.fillText(nick.join(" "), 353,440);
    pfCtx.fillText(exp[id].exp.toString() + " / " + levels[exp[id].lvl].exp, 506,530);
    pfCtx.fillText(exp[id].money, 506,568);

    if(exp[id].badges && exp[id].badges.length > 0){
        for(var i=0;i<exp[id].badges.length;i++){
            if(exp[id].badges[i] != undefined){
                var row = 0;
                if(i>2) row += Math.floor(i>3);
                var column = i - (row*3)
                var y = 430 + (75*row);
                var x = 775 + (80*column);

                img.src=fs.readFileSync(`images/badges/${exp[id].badges[i]}.png`);
                pfCtx.drawImage(img,x,y,70,70);
            }
        }
    }

    require('gif-frames')({ url: "https://cdn.discordapp.com/avatars/343139575704715265/a_c4982f20eb19168e3968dd92088f7b87.gif", frames: "all", cumulative:true}).then(function (frameData) {
        message.channel.send(`Preparing...`).then(msg=>{
            frameData.forEach(function (frame) {
                img.src = frame.getImage()._obj;
                pfCtx.drawImage(img,72,296,195,195);
                console.log(frame.frameIndex); 
                encoder.addFrame(pfCtx);
            });
            encoder.finish();
            
            require('imgur-uploader')(fs.readFileSync(`../temp/${id}.gif`), {title: 'Profile!'}).then(data => {
                msg.delete();
                console.log(data)
                message.channel.send(data.link);
            });
        })     
    });
catch(e){
util.log(client,`${e}
Source: ${__filename.split('/root/bots/')[1]}`)
}
}
}