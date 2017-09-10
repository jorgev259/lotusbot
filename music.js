const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');
var ypi = require('youtube-playlist-info');
var voiceConnection;
let queue = [];
let DEFAULT_VOLUME = 50;
var defaultPlaylist;

module.exports = {
    startAuto:function(client,connection,playlist){
        ypi.playlistInfo(process.env.youtubeapi, playlist, function(playlistItems) {
            defaultPlaylist=playlistItems;
            voiceConnection = connection;
            module.exports.playSong();
        });
    },

	play:function(msg, suffix, client) {
		// Make sure the user is in a voice channel.
		if (msg.member.voiceChannel === undefined) return msg.channel.send(wrap('You\'re not in a voice channel.'));

		// Make sure the suffix exists.
		if (!suffix) return msg.channel.send(wrap('No video specified!'));

		// Get the video information.
		msg.channel.send(wrap('Searching...')).then(response => {
			var searchstring = suffix
			if (!suffix.toLowerCase().startsWith('http')) {
				searchstring = 'gvsearch1:' + suffix;
			}

			YoutubeDL.getInfo(searchstring, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
				// Verify the info.
				if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
					return response.edit(wrap('Invalid video!'));
				}

				info.requester = msg.author;

				// Queue the video.
				response.edit(wrap('Queued: ' + info.title)).then(() => {
					queue.push(info);
					// Play if only one element in the queue.
					if (queue.length === 1) module.exports.playSong();
				}).catch(console.log);
			});
		}).catch(console.log);
	},


	skip:function(msg, suffix, client) {
		// Get the voice connection
        var staff = msg.member.guild.roles.find("name", "Staff Team");

		if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

		if (!(queue[0].requester.id === msg.member.id || msg.member.roles.has(staff.id))) return msg.channel.send(wrap('You cannot skip this as you didn\'t queue it. Ask a staff member to skip it if needed'));
		// Get the number to skip.
		let toSkip = 1; // Default 1.
		if (!isNaN(suffix) && parseInt(suffix) > 0) {
			toSkip = parseInt(suffix);
		}
		toSkip = Math.min(toSkip, queue.length);

		// Skip.
		queue.splice(0, toSkip - 1);

		// Resume and stop playing.
		const dispatcher = voiceConnection.player.dispatcher;
		if (voiceConnection.paused) dispatcher.resume();
		dispatcher.end();

		msg.channel.send(wrap('Skipped ' + toSkip + '!'));
	},

	queue:function(msg, suffix, client) {
		// Get the queue text.
		const text = queue.map((video, index) => (
			(index + 1) + ': ' + video.title + " (Requested by " + video.requester.username + "#" + video.requester.discriminator + ")"
		)).join('\n');

		// Get the status of the queue.
		let queueStatus = 'Stopped';
		if (voiceConnection !== null) {
			const dispatcher = voiceConnection.player.dispatcher;
			queueStatus = dispatcher.paused ? 'Paused' : 'Playing';
		}

		// Send the queue and status.
		msg.channel.send(wrap('Queue (' + queueStatus + '):\n' + text));
	},

	pause:function(msg, suffix, client) {
		// Get the voice connection.
		if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

		// Pause.
		msg.channel.send(wrap('Playback paused.'));
		const dispatcher = voiceConnection.player.dispatcher;
		if (!dispatcher.paused) dispatcher.pause();
    },

	join:function(msg,client) {
        msg.member.voiceChannel.join();
	},

	clearqueue:function(msg, suffix, client) {
        queue.splice(0, queue.length);
        msg.channel.send(wrap('Queue cleared!'));
    },

	resume:function(msg, suffix, client) {
		// Get the voice connection.
		if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

		// Resume.
		msg.channel.send(wrap('Playback resumed.'));
		const dispatcher = voiceConnection.player.dispatcher;
		if (dispatcher.paused) dispatcher.resume();
	},

	volume:function(msg, suffix, client) {
		// Get the voice connection.
		if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

		// Get the dispatcher
		const dispatcher = voiceConnection.player.dispatcher;

		if (suffix > 200 || suffix < 0) return msg.channel.send(wrap('Volume out of range!'));
		msg.channel.send(wrap("Volume set to " + suffix));
		dispatcher.setVolume((suffix/100));
    },

	playSong:function() {
		// If the queue is empty, finish.
		if (queue.length === 0) {
            var song = defaultPlaylist[(Math.floor((Math.random() * defaultPlaylist.length) + 1))];
            queue[0] = {};
            queue[0].title = song.title;
            queue[0].webpage_url = "https://www.youtube.com/watch?v=" + song.resourceId.videoId;
            queue[0].requester = voiceConnection.client.user;
		}

        const video = queue[0];

        let dispatcher = voiceConnection.playStream(ytdl(video.webpage_url, {filter: 'audioonly'}), {seek: 0, volume: (DEFAULT_VOLUME/100)});

        voiceConnection.on('error', (error) => {
		// Skip to the next song.
			console.log(error);
			queue.shift();
			module.exports.playSong();
		});

		dispatcher.on('error', (error) => {
			// Skip to the next song.
			console.log(error);
			queue.shift();
			module.exports.playSong();
		});

		dispatcher.on('end', () => {
            module.exports.playSong();
		});
	}
}

function wrap(text) {
	return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
}
