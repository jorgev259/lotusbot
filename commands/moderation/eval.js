module.exports = {
    desc:"Runs the written code (Use with precaution). >eval <code>",
    async execute(client, message, param, db){
            param = param.slice(1)
            const code = param.join(" ");
            let evaled = "";
            try {
                evaled = eval(`async function a(){${code}}; a()`);
            }
            catch(err) {
                evaled = err.message;
            }
            

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            if (typeof(evaled) === "string")
                evaled = evaled.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

            message.channel.send(evaled, {code:"xl",split:true});
    }
}
