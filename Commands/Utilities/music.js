const { CommandInteraction, MessageEmbed, Client } = require("discord.js");

module.exports = {
	name: "music",
	description: "Music commands",
	usage: "/music <command>",
	cooldown: 5000,
	options: [
		{ name: "play", description: "Play a song", type: "SUB_COMMAND",
			options: [{name: "query", description: "The song to play", type: "STRING", required: true}],
		},
		{ name: "volume", description: "Change the volume", type: "SUB_COMMAND",
			options: [{name: "percent", description: "The volume to set (10 = 10%)", type: "NUMBER", required: true}],
		},
		{
            name: "seek", description: "Seeks to the specified position.", value: "seek", type: "SUB_COMMAND",
            options: [{ name: "time", description: "Provide a position (in seconds) to seek.", type: "NUMBER", required: true}],
        },
        {
            name: "filters", description: "Toggle filters", type: "SUB_COMMAND",
            options: [{ name: "set", description: "Choose a filter", type: "STRING", required: true,
            choices: [
                {name: "🔌 Turn off all filters", value: "false"},
                {name: "📣 Toggle 8d filter", value: "8d"},
                {name: "📣 Toggle bassboost filter", value: "bassboost"},
                {name: "📣 Toggle echo filter", value: "echo"},
                {name: "📣 Toggle nightcore filter", value: "nightcore"},
                {name: "📣 Toggle surround filter", value: "surround"},
                {name: "📣 Toggle karaoke filter", value: "karaoke"},
                {name: "📣 Toggle vaporwave filter", value: "vaporwave"},
                {name: "📣 Toggle flanger filter", value: "flanger"},
                {name: "📣 Toggle gate filter", value: "gate"},
                {name: "📣 Toggle haas filter", value: "haas"},
                {name: "📣 Toggle reverse filter", value: "reverse"},
                {name: "📣 Toggle mcompand filter", value: "mcompand"},
                {name: "📣 Toggle phaser filter", value: "phaser"},
                {name: "📣 Toggle tremolo filter", value: "tremolo"},
                {name: "📣 Toggle earwax filter", value: "earwax"},
            ]}]
        },
		{ name: "settings",	description: "Change the settings",	type: "SUB_COMMAND",
			options: [{name: "options", description: "The settings to change", type: "STRING", required: true, 
				choices: [
					{name: "▶️ | Now Playing", value: "now"},
					{name: "🔢 | View queue", value: "queue"},
					{name: "⏭️ | Skip", value: "skip"},
					{name: "⏸️ | Pause", value: "pause"},
					{name: "⏯️ | Resume", value: "resume"},
					{name: "⏹️ | Stop", value: "stop"},
					{name: "🔀 | Shuffle", value: "shuffle"},
					{name: "🔃 | Toogle autoplay", value: "autoplay"},
					{name: "🈁 | Add related song", value: "related"},
					{name: "🔁 | Repeat mode", value: "repeat"},
		]}],},
	],
	/**
	 * 
	 * @param {CommandInteraction} interaction 
	 * @param {Client} client 
	 */
	async execute(interaction, client) {
		const { options, member, guild, channel } = interaction;
		const VoiceChannel = member.voice.channel;
		
		if (!VoiceChannel)
			return interaction.reply({content: "You must be in a voice channel to use this command.", ephemeral: true});

		if (guild.me.voice.channelId && VoiceChannel.id !== guild.me.voice.channelId)
			return interaction.reply({content: `You must be in the same voice channel as me to use this command (<#${guild.me.voice.channelId}>)`, ephemeral: true});

		try {
			switch (options.getSubcommand()) {
				case "play": {
					client.distube.playVoiceChannel(VoiceChannel, options.getString("query"), {textChannel: channel, member: member});
					return interaction.reply({content: `🎼 Request recieved.`});
				}
				case "volume": {
					const volume = options.getNumber("percent");
					if (volume < 0 || volume > 100)
						return interaction.reply({content: `Volume must be between 0 and 100.`, ephemeral: true});
					client.distube.setVolume(VoiceChannel, volume);
					return interaction.reply({content: `🔊 Volume has been set to \`${volume}%\``});
				}
				case "seek" : {
                    const queue = await client.distube.getQueue(VoiceChannel);
                    const Time = options.getNumber("time");

                    if(!queue)
                    return interaction.reply({content: "⛔ There is no queue"});

                    await queue.seek(Time);
                    return interaction.reply({content: `🪄 **Seeked to \`${Time}\`**`});
                }
				case "settings": {
					const queue = await client.distube.getQueue(VoiceChannel);
					if (!queue) return interaction.reply({content: `⛔ There is no queue for this channel.`, ephemeral: true});

					switch (options.getString("options")) {
						case "skip": 
							await queue.skip(VoiceChannel);
							return interaction.reply({content: `⏭️ Song has been skipped.`});

						case "stop": 
							await queue.stop(VoiceChannel);
							return interaction.reply({content: `⏹️ Song has been stopped.`});
						
						case "pause": 
							await queue.pause(VoiceChannel);
							return interaction.reply({content: `⏸️ Song has been paused.`});
						
						case "resume": 
							await queue.resume(VoiceChannel);
							return interaction.reply({content: `▶️ Song has been resumed.`});
						
						case "shuffle":
							await queue.shuffle(VoiceChannel);
							return interaction.reply({content: `🔀 Song has been shuffled.`});

						case "autoplay":
							let autoplayMode = await queue.toggleAutoplay(VoiceChannel);
							return interaction.reply({content: `🔃 Autoplay mode is now \`${autoplayMode ? "On" : "Off"}\``});
						
						case "related":
							await queue.addRelatedSong(VoiceChannel);
							return interaction.reply({content: `🈁 A related song has been added.`});

						case "repeat":
							let repeatMode = await client.distube.setRepeatMode(queue);
							return interaction.reply({content: `🔁 Repeat mode is now \`${repeatMode = repeatMode ? repeatMode == 2 ? "Queue" : "Song" : "Off"}\``});

						case "now":
							const nowPlaying = await client.distube.getNowPlaying(VoiceChannel) || "Nothing";
							return interaction.reply({embed: [new MessageEmbed()
								.setColor("PURPLE")
								.setTitle(`Now playing:`)
								.setDescription(`${nowPlaying}`)
							]});

						case "queue": 
							return interaction.reply({embeds: [new MessageEmbed()
								.setColor("PURPLE")
								.setTitle(`${interaction.guild} Queue`)
								.setDescription(`${queue.songs.slice(0, 10).map(
									(song, id) => `\n**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``)}`)]});
					}
					return;
				}
				case "filters" : {
                    const queue = await client.distube.getQueue(VoiceChannel);

                    if(!queue)
                    return interaction.reply({content: "⛔ There is no queue"});

                    switch(options.getString("set")) {
                        case "false" : 
                        await queue.setFilter(false);
                        return interaction.reply({content: `❎ Disabled all filters.`});

                        case "8d" : 
                        await queue.setFilter(`3d`);
                        return interaction.reply({content: `✅ Toggled the 8D filter.`});

                        case "karaoke" : 
                        await queue.setFilter(`karaoke`);
                        return interaction.reply({content: `✅ Toggled the karaoke filter.`});
                        
                        case "vaporwave" : 
                        await queue.setFilter(`vaporwave`);
                        return interaction.reply({content: `✅ Toggled the vaporwave filter.`});

                        case "flanger" : 
                        await queue.setFilter(`flanger`);
                        return interaction.reply({content: `✅ Toggled the flanger filter.`});

                        case "gate" : 
                        await queue.setFilter(`gate`);
                        return interaction.reply({content: `✅ Toggled the gate filter.`});

                        case "haas" : 
                        await queue.setFilter(`haas`);
                        return interaction.reply({content: `✅ Toggled the haas filter.`});

                        case "reverse" : 
                        await queue.setFilter(`reverse`);
                        return interaction.reply({content: `✅ Toggled the reverse filter.`});

                        case "mcompand" : 
                        await queue.setFilter(`mcompand`);
                        return interaction.reply({content: `✅ Toggled the mcompand filter.`});

                        case "phaser" : 
                        await queue.setFilter(`phaser`);
                        return interaction.reply({content: `✅ Toggled the phaser filter.`});

                        case "tremolo" : 
                        await queue.setFilter(`tremolo`);
                        return interaction.reply({content: `✅ Toggled the tremolo filter.`});

                        case "earwax" : 
                        await queue.setFilter(`earwax`);
                        return interaction.reply({content: `✅ Toggled the earwax filter.`});

                        case "bassboost" : 
                        await queue.setFilter(`bassboost`);
                        return interaction.reply({content: `✅ Toggled the bassboost filter.`});
                        
                        case "echo" : 
                        await queue.setFilter(`echo`);
                        return interaction.reply({content: `✅ Toggled the echo filter.`});
                        
                        case "nightcore" : 
                        await queue.setFilter(`nightcore`);
                        return interaction.reply({content: `✅ Toggled the nightcore filter.`});
                        
                        case "surround" : 
                        await queue.setFilter(`surround`);
                        return interaction.reply({content: `✅ Toggled the surround filter.`});
                        
                    }
                }
			}
		} catch (error) {
			const errorEmbed = new MessageEmbed()
				.setColor("RED")
				.setDescription(`⛔ Alert: \`${error}\``);
			return interaction.reply({embeds: [errorEmbed], ephemeral: true});
		}
	}
}