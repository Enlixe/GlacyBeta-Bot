const { MessageEmbed, CommandInteraction } = require('discord.js');
const { emit } = require('process');

module.exports = {
    name: 'update',
    description: 'Check for updates on GitHub.',
    usage: '/update',
    permissions: ['ADMINISTRATOR'],
    devsOnly: true,
    cooldown: 10000,
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
		const interactionChannel = interaction.channel;
		const Embed = new MessageEmbed()
			.setAuthor('Enlixe | Update')
			.setDescription('Checking for updates...')
			.addField(`Status`, '🔵 | Checking for updates...')
			.setColor('BLURPLE');
		interactionChannel.send({ content: " ", embed: Embed });

		log.info('EnlX > Update | Checking for updates...');
		const updateLink = "Enlixe/GlacyBeta-Bot"
		const version = require('../../package.json').version;
		const fetch = require('node-fetch');
		fetch(`https://api.github.com/repos/${updateLink}/releases/latest`)
			.then(res => res.json())
			.then(async(body) => {
				if (body.name > version) {
					log.warn( `EnlX > Update | There is a new version of EnlX available !`);
					log.warn( `EnlX > Update | Current Version: v${version}` );
					log.warn( `EnlX > Update | New Version: ${body.tag_name}` );
					log.warn( `EnlX > Update | Download: ${body.zipball_url}` );
					
					Embed.setDescription(`There is a new version of EnlX available !\nCurrent Version: v${version}\nNew Version: ${body.tag_name}`);
					interactionChannel.send({ embed: Embed });
					
					// Git Pull and Restart
					log.info( `EnlX > Update | Pulling latest changes...` );
					
					Embed.addField(`Status`, '🟡 | Pulling latest changes...');
					interactionChannel.send({ embed: Embed });

					const { exec } = require('child_process');
					exec(`git pull https://github.com/${updateLink}`, (err, stdout, stderr) => {
						if (err) {
							log.error( `EnlX > Update | Error: ${err}` );

							Embed.addField(`Status`, '🔴 | Error');
							interactionChannel.send({ embed: Embed });
							return;
						}
						log.info( `EnlX > Update | Pull complete.` );
						log.info( `EnlX > Update | Restarting...` );

						Embed.addField(`Status`, '🟢 | Pull complete. Restarting...');
						interactionChannel.send({ embed: Embed });

						process.exit(1);
					});
				} else {
					log.info( `EnlX > Update | You are running the latest version of EnlX.` );
					log.info( `EnlX > Update | Current Version: v${version} - Github Version: ${body.tag_name}` );
					
					Embed.setDescription(`You are running the latest version of EnlX.\nCurrent Version: v${version} - Github Version: ${body.tag_name}`);
					interactionChannel.send({ embed: Embed });
				}
			})
			.catch(err => {
				log.error(`EnlX > Update | There was an error checking for updates!\n${err}`);
				Embed.setDescription(`There was an error checking for updates!\n${err}`);
				Embed.addField(`Status`, '🔴 | Error');
				Embed.setColor('RED');
				interactionChannel.send({ embed: Embed });
			});
	}
}