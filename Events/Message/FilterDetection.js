const { Message, Client, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    /**
     * @param {Message} message
     * @param {Client} client
     */
    async execute(message, client) {
        if (message.author.bot) return;

        const { content, guild, author, channel } = message;
        const messageContent = content.toLowerCase().split(' ');

        const filter = client.filters.get(guild.id);
        if (!filter) return;

        const wordsUsed = [];
        let shouldDelete = false;

        messageContent.forEach((word) => {
            if (filter.includes(word)) {
                wordsUsed.push(word);
                shouldDelete = true;
            }
        });

        if (shouldDelete) message.delete().catch(() => {});

        if (wordsUsed.length) {
            const channelID = client.filtersLog.get(guild.id);
            if (!channelID) return;
            const channelObject = guild.channels.cache.get(channelID);
            if (!channelObject) return;

            const embed = new MessageEmbed()
                .setTitle('Message Deleted')
                .setColor('RED')
                .setAuthor({
                    name: author.tag,
                    iconURL: author.avatarURL({ dynamic: true }),
                })
                .setDescription(
                    [
                        `Used ${wordsUsed.length} blacklisted word(s) in ${channel} =>`,
                        `\`${wordsUsed.map((w) => w)}\``,
                    ].join('\n')
                );

            channelObject.send({ embeds: [embed] });
        }
    },
};
