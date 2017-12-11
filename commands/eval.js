module.exports = {
    desc:"This is a description",
    execute(client, message, param){
        try {
            /*var exp = json.readFileSync("../data/exp.json");
            var inventory = json.readFileSync("../data/inventory.json");*/
            param= param.slice(1)
            const code = param.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            if (typeof(evaled) === "string")
                evaled = evaled.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

            message.channel.send(evaled, {code:"xl",split:true});
        } catch (err) {
            message.channel.send(`${err}`,{code:"xl"});
        }
    }
}