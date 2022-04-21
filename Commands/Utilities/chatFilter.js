const { Client, CommandInteraction, MessageEmbed } = require('discord.js');
const Schema = require('../../Structures/Schemas/FilterDB.js');
const sourcebin = require('sourcebin');

module.exports = {
    name: 'filter',
    description: 'Simple chat filtering system.',
    permission: 'MANAGE_MESSAGES',
    options: [
        {
            name: 'help',
            description: 'Shows this help message.',
            type: 'SUB_COMMAND',
        },
        {
            name: 'clear',
            description: 'Clears all filters.',
            type: 'SUB_COMMAND',
        },
        {
            name: 'list',
            description: 'Lists all filters.',
            type: 'SUB_COMMAND',
        },
        {
            name: 'setup',
            description: 'Set the filtering system',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'logging',
                    description:
                        'Set the logging channel for the filter system.',
                    type: 'CHANNEL',
                    channelTypes: ['GUILD_TEXT'],
                    required: true,
                },
            ],
        },
        {
            name: 'configure',
            description: 'Configure the filter system.',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'options',
                    description: 'Select the options to configure.',
                    type: 'STRING',
                    required: true,
                    choices: [
                        { name: 'Add', value: 'add' },
                        { name: 'Remove', value: 'remove' },
                    ],
                },
                {
                    name: 'word',
                    description: 'The word to add or remove.',
                    type: 'STRING',
                    required: true,
                },
            ],
        },
    ],
    /**
     *
     * @param { CommandInteraction } interaction;
     * @param {Client} client;
     */
    async execute(interaction, client) {
        await interaction.deferReply();
        const { guild, options } = interaction;

        const subCommand = options.getSubcommand();

        switch (subCommand) {
            case 'help':
                const Embed = new MessageEmbed()
                    .setColor(0x00ff00)
                    .setTitle('Filter Help')
                    .setDescription([
                        '**How do i add or remove a word from the blacklist.**\nBy using /filter [configure] [add/remove] [word]',
                        '**How do i list all the words in the blacklist.**\nBy using /filter [list]',
                        '**How do i clear all the words in the blacklist.**\nBy using /filter [clear]',
                    ]);
                interaction.editReply({
                    embed: { Embed },
                });
                break;
            case 'clear':
                await Schema.findOneAndUpdate(
                    { Guild: guild.id },
                    { Words: [] }
                );
                client.filters.set(guild.id, []);
                interaction.editReply('Cleared the blacklist.');
                break;
            case 'list':
                const Data = await Schema.findOne({ Guild: guild.id });
                if (!Data) return interaction.editReply('No filters found.');
                await sourcebin
                    .create(
                        [
                            {
                                content: `${
                                    Data.Words.map((w) => w).join('\n') ||
                                    'none'
                                }`,
                                language: 'text',
                            },
                        ],
                        {
                            title: `${guild.name} | Blacklist`,
                            description: ``,
                        }
                    )
                    .then((bin) => {
                        interaction.editReply({ content: `${bin.url}` });
                    });
                break;
            case 'setup':
                const logChannel = options.getChannel('logging').id;

                await Schema.findOneAndUpdate(
                    { Guild: guild.id },
                    { Log: logChannel },
                    { new: true, upsert: true }
                );

                client.filtersLog.set(guild.id, logChannel);

                interaction.editReply({
                    content: `Added ${logChannel} to the filter logging channel.`,
                    ephemeral: true,
                });
                break;
            case 'configure':
                const choice = options.getString('options');
                const Words = options
                    .getString('word')
                    .toLowerCase()
                    .split(',');

                switch (choice) {
                    case 'add':
                        Schema.findOne(
                            {
                                Guild: guild.id,
                            },
                            async (err, data) => {
                                if (err) throw err;
                                if (!data) {
                                    await Schema.create({
                                        Guild: guild.id,
                                        Log: null,
                                        Words: Words,
                                    });
                                    client.filters.set(guild.id, Words);
                                    return interaction.editReply({
                                        content: `Added ${Words.length} new word(s) to the blacklist.`,
                                    });
                                }
                                const newWords = [];

                                Words.forEach((w) => {
                                    if (data.Words.includes(w)) return;
                                    newWords.push(w);
                                    data.Words.push(w);
                                    client.filters.get(guild.id).push(w);
                                });

                                interaction.editReply({
                                    content: `Added ${newWords.length} new word(s) to the blacklist.`,
                                });

                                data.save();
                            }
                        );
                        break;
                    case 'remove':
                        Schema.findOne(
                            { Guild: guild.id },
                            async (err, data) => {
                                if (err) throw err;
                                if (!data) {
                                    return interaction.editReply({
                                        content: 'There are no data to remove.',
                                    });
                                }

                                const removeWords = [];
                                Words.forEach((w) => {
                                    if (!data.Words.includes(w)) return;
                                    data.Words.remove(w);
                                    removeWords.push(w);
                                });

                                const newArray = client.filters
                                    .get(guild.id)
                                    .filter(
                                        (word) => !removeWords.includes(word)
                                    );

                                client.filters.set(guild.id, newArray);
                                interaction.editReply({
                                    content: `Removed ${removeWords.length} word(s) from the blacklist.`,
                                });

                                data.save();
                            }
                        );
                        break;
                }
                break;
        }
    },
};
