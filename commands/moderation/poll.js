var util = require('../../utilities.js');

module.exports = {
    desc:"Creates an automatic poll. Usage: >poll <minutes> <question>",
    async execute(client, message, param){
            message.delete();
            var optionMessage = await message.reply("type the options for you poll. Example: `option 1|Option 2|Non numbered option`")
            const collector = message.channel.createMessageCollector(
                m => m.author.id == message.author.id,
                { max: 1 }
            );
            collector.on('collect', m => {
                m.delete();
                optionMessage.delete();
                var time = parseInt(param[1]);
                param= param.slice(2)
                var text = param.join(" ") + ": \n";
                var count = 0;
                var options = m.content.split("|");
                options.forEach(function(option){
                    text += (count+1) + ") `"  + option + "`:white_small_square:";
                    count++;
                })
                message.channel.send(text).then(poll => {
                    util.reactNumber(0,count,poll);
                    message.channel.send("Poll will be over in "  + time + " minutes").then(pollTime => {
                        setTimeout(function(){
                            pollTime.delete();
                            var results = []
                            poll.reactions.array().forEach(function(reaction){
                                results.push({"name":options[(parseInt(reaction._emoji.name.charAt(0)))-1],"points":parseInt(reaction.count)});
                            })

                            results.sort(function(a,b){
                                return a.points - b.points
                            })

                            var winners = [results[results.length-1]];
                            for(var i=results.length-2;i>=0;i--){
                                if(results[i].points == results[i+1].points){
                                    winners.push(results[i]);
                                }else{
                                    i=-1;
                                }
                            }

                            if(winners.length == 1){
                                message.channel.send("Poll has finished. *drumrolls*\n" + param.join(" ") + " " + winners[0].name+ "!");
                            }else{
                                var response = "Poll has finished. " + param.join(" ") + "\n*drumrolls*\nThere was a tie between " + winners[0].name;
                                for(var i=1;i<winners.length;i++){
                                    if(i+1 == winners.length){
                                        response += " and " + winners[i].name;
                                    }else{
                                        response += ", " + winners[i].name;
                                    }
                                }
                                message.channel.send(response);
                            }
                        },time*60000)
                    });
                });
            });
    }
}
