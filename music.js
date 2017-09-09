const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');
var ypi = require('youtube-playlist-info');
var voiceConnection;
let queue = [];
let DEFAULT_VOLUME = 50;
var defaultPlaylist;


/**
 * Takes a discord.js client and turns it into a music bot.
 * Thanks to 'derekmartinez18' for helping.
 *
 * @param {Client} client - The discord.js client.
 * @param {object} options - (Optional) Options to configure the music bot. Acceptable options are:
 * 							prefix: The prefix to use for the commands (default '!').
 * 							global: Whether to use a global queue instead of a server-specific queue (default false).
 * 							maxQueueSize: The maximum queue size (default 20).
 * 							anyoneCanSkip: Allow anybody to skip the song.
 * 							clearInvoker: Clear the command message.
 * 							volume: The default volume of the player.
 */
module.exports = {
    startAuto:function(client,connection,playlist){
        ypi.playlistInfo(process.env.youtubeapi, playlist, function(playlistItems) {
            defaultPlaylist=playlistItems;
            voiceConnection = connection;
            module.exports.executeQueue("",client);
        });
    },

	/**
	 * The command for adding a song to the queue.
	 *
	 * @param {Message} msg - Original message.
	 * @param {string} suffix - Command suffix.
	 * @returns {<promise>} - The response edit.
	 */
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

				info.requester = msg.author.id;

				// Queue the video.
				response.edit(wrap('Queued: ' + info.title)).then(() => {
					queue.push(info);
					// Play if only one element in the queue.
					if (queue.length === 1) module.exports.executeQueue(msg, client);
				}).catch(console.log);
			});
		}).catch(console.log);
	},

	/**
	 * The command for skipping a song.
	 *
	 * @param {Message} msg - Original message.
	 * @param {string} suffix - Command suffix.
	 * @returns {<promise>} - The response message.
	 */
	skip:function(msg, suffix, client) {
		// Get the voice connection
        var staff = msg.member.guild.roles.find("name", "Staff");

		if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

		if (!(queue[0].requester === msg.member.id || msg.member.roles.has(staff.id))) return msg.channel.send(wrap('You cannot skip this as you didn\'t queue it. Ask a staff member to skip it if needed'));
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

	/**
	 * The command for listing the queue.
	 *
	 * @param {Message} msg - Original message.
	 * @param {string} suffix - Command suffix.
	 */
	queue:function(msg, suffix, client) {
		// Get the queue text.
		const text = queue.map((video, index) => (
			(index + 1) + ': ' + video.title
		)).join('\n');

		// Get the status of the queue.
		let queueStatus = 'Stopped';
		const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
		if (voiceConnection !== null) {
			const dispatcher = voiceConnection.player.dispatcher;
			queueStatus = dispatcher.paused ? 'Paused' : 'Playing';
		}

		// Send the queue and status.
		msg.channel.send(wrap('Queue (' + queueStatus + '):\n' + text));
	},

	/**
	 * The command for pausing the current song.
	 *
	 * @param {Message} msg - Original message.
	 * @param {string} suffix - Command suffix.
	 * @returns {<promise>} - The response message.
	 */
	pause:function(msg, suffix, client) {
		// Get the voice connection.
		const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
		if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

		// Pause.
		msg.channel.send(wrap('Playback paused.'));
		const dispatcher = voiceConnection.player.dispatcher;
		if (!dispatcher.paused) dispatcher.pause();
    },

	/**
	 * The command for leaving the channel and clearing the queue.
	 *
	 * @param {Message} msg - Original message.
	 * @param {string} suffix - Command suffix.
	 * @returns {<promise>} - The response message.
	 */
	join:function(msg,client) {
        msg.member.voiceChannel.join();
	},

	/**
	 * The command for clearing the song queue.
	 *
	 * @param {Message} msg - Original message.
	 * @param {string} suffix - Command suffix.
	 */
	clearqueue:function(msg, suffix, client) {
			queue.splice(0, queue.length);
			msg.channel.send(wrap('Queue cleared!'));
    },

	/**
	 * The command for resuming the current song.
	 *
	 * @param {Message} msg - Original message.
	 * @param {string} suffix - Command suffix.
	 * @returns {<promise>} - The response message.
	 */
	resume:function(msg, suffix, client) {
		// Get the voice connection.
		if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

		// Resume.
		msg.channel.send(wrap('Playback resumed.'));
		const dispatcher = voiceConnection.player.dispatcher;
		if (dispatcher.paused) dispatcher.resume();
	},

	/**
	 * The command for changing the song volume.
	 *
	 * @param {Message} msg - Original message.
	 * @param {string} suffix - Command suffix.
	 * @returns {<promise>} - The response message.
	 */
	volume:function(msg, suffix, client) {
		// Get the voice connection.
		if (voiceConnection === null) return msg.channel.send(wrap('No music being played.'));

		// Get the dispatcher
		const dispatcher = voiceConnection.player.dispatcher;

		if (suffix > 200 || suffix < 0) return msg.channel.send(wrap('Volume out of range!'));
		msg.channel.send(wrap("Volume set to " + suffix));
		dispatcher.setVolume((suffix/100));
    },

	/**
	 * Executes the next song in the queue.
	 *
	 * @param {Message} msg - Original message.
	 * @param {object} queue - The song queue for this server.
	 * @returns {<promise>} - The voice channel.
	 */
	executeQueue:function(msg,client) {
		// If the queue is empty, finish.
		if (queue.length === 0) {
            client.channels.find('name','music-bot').send(">play https://www.youtube.com/watch?v=" + defaultPlaylist[(Math.floor((Math.random() * defaultPlaylist.length) + 1))].resourceId.videoId);
			return;
		}

		new Promise((resolve, reject) => {
			// Join the voice channel if not already in one.
			if (voiceConnection === null) {
				// Check if the user is in a voice channel.
				if (msg.member.voiceChannel) {
					msg.member.voiceChannel.join().then(connection => {
						resolve(connection);
					}).catch((error) => {
						console.log(error);
					});
				} else {
					// Otherwise, clear the queue and do nothing.
					queue.splice(0, queue.length);
					reject();
				}
			} else {
				resolve(voiceConnection);
			}
		}).then(connection => {
			// Get the first item in the queue.
			const video = queue[0];

			// Play the video.
			msg.channel.send(wrap('Now Playing: ' + video.title)).then(() => {
				let dispatcher = connection.playStream(ytdl(video.webpage_url, {filter: 'audioonly'}), {seek: 0, volume: (DEFAULT_VOLUME/100)});

				connection.on('error', (error) => {
					// Skip to the next song.
					console.log(error);
					queue.shift();
					module.exports.executeQueue(msg, client);
				});

				dispatcher.on('error', (error) => {
					// Skip to the next song.
					console.log(error);
					queue.shift();
					module.exports.executeQueue(msg, client);
				});

				dispatcher.on('end', () => {
					// Wait a second.
					setTimeout(() => {
						if (queue.length > 0) {
							// Remove the song from the queue.
							queue.shift();
							// Play the next song in the queue.
							module.exports.executeQueue(msg, client);
						}
					}, 1000);
				});
			}).catch((error) => {
				console.log(error);
			});
		}).catch((error) => {
			console.log(error);
		});
	}
}

/**
 * Wrap text in a code block and escape grave characters.
 *
 * @param {string} text - The input text.
 * @returns {string} - The wrapped text.
 */
function wrap(text) {
	return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
}
