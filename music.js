var YoutubeDL = require('youtube-dl');
var yt = require('ytdl-core');
var ypi = require('youtube-playlist-info');
var voiceConnection;
let queue = [];
var defaultPlaylist;

module.exports = {
    set:function(client,playlist){
        client.channels.find('name','🎵 Music 24/7 🎵').join().then(connection =>{
            ypi.playlistInfo(process.env.youtubeapi, playlist, function(playlistItems) {
                defaultPlaylist=playlistItems;
                voiceConnection = connection;
                module.exports.play();
            });
        })
    },

    play:function(){
		let dispatcher;

        if (queue.length == 0){

            var next = defaultPlaylist[(Math.floor((Math.random() * defaultPlaylist.length) + 1))];
            queue[0] = {};
            queue[0].title = next.title;
            queue[0].url = "https://www.youtube.com/watch?v=" + next.resourceId.videoId;
            queue[0].requester = voiceConnection.client.user;
        };
        var song = queue[0];
        console.log(song);
        //msg.channel.send(`Playing: **${song.title}** as requested by: **${song.requester}**`);
        dispatcher = voiceConnection.playStream(yt(song.url, { audioonly: true }));
			/*let collector = msg.channel.createMessageCollector(m => m);
			collector.on('message', m => {
				if (m.content.startsWith(tokens.prefix + 'pause')) {
					msg.channel.send('paused').then(() => {dispatcher.pause();});
				} else if (m.content.startsWith(tokens.prefix + 'resume')){
					msg.channel.send('resumed').then(() => {dispatcher.resume();});
				} else if (m.content.startsWith(tokens.prefix + 'skip')){
					msg.channel.send('skipped').then(() => {dispatcher.end();});
				} else if (m.content.startsWith('volume+')){
					if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
					msg.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith('volume-')){
					if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
					msg.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith(tokens.prefix + 'time')){
					msg.channel.send(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
			});*/
        dispatcher.on('end', () => {
            queue.shift();
			module.exports.play();
        });
        dispatcher.on('error', (err) => {
            msg.channel.send('error: ' + err)
            queue.shift();
			module.exports.play();
        });
    },


	join:function(msg){
        const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('I couldn\'t connect to your voice channel...');
		voiceChannel.join();
	},

	add:function(msg){
		let url = msg.content.split(' ')[1];
		if (url == '' || url === undefined) return msg.channel.send(`You must add a YouTube video url, or id after`);
		yt.getInfo(url, (err, info) => {
			if(err) return msg.channel.send('Invalid YouTube Link: ' + err);
			queue.push({url: url, title: info.title, requester: msg.author});
			msg.channel.send(`added **${info.title}** to the queue`);
		});
	},
	queue:function(msg){
		let tosend = [];
		queue.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester.username}`);});
		msg.channel.send(`Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
	},
}

function wrap(text) {
	return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
}
