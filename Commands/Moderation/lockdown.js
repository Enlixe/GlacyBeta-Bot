const { CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'lockdown',
    description: 'Locks channel',
    permissions: 'ADMINISTRATOR',
    options: [
        {
            name: 'state',
            description: 'lock/unlock the channel',
            required: true,
            type: 'STRING',
            choices: [
                {
                    name: 'lock',
                    description: 'Lock the given channel',
                    value: 'lock',
                },
                {
                    name: 'unlock',
                    description: 'Lock the given channel',
                    value: 'unlock',
                },
            ],
        },
        {
            name: 'channel',
            description: 'Select a channel to lock',
            required: true,
            type: 'CHANNEL',
        },
        {
            name: 'reason',
            description: 'The reason for locking the channel',
            required: false,
            type: 'STRING',
        },
    ],
    /**
     *
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const state = interaction.options.getString('state');
        const reason =
            interaction.options.getString('reason') || 'None provided';
        const Channel = interaction.options.getChannel('channel');
        const role = interaction.guild.roles.everyone;

        if (state === 'lock') {
            Channel.permissionOverwrites.edit(role, { SEND_MESSAGES: false }); // this can be set to 'null' which will make the permission for sending messages gray

            const lockEmbed = new MessageEmbed()
                .setDescription(`Channel locked by ${interaction.user.tag}`)
                .addField('**Reason:**', `${reason}`)
                .setColor('#ff9913')
                .setImage(
                    'https://images-ext-2.discordapp.net/external/HnFjw6XFfc42nFtn_a_5C3dXKOH0w2UgfxNNTGUbJVY/https/static.wixstatic.com/media/22ae00_1132ccce7aca4550a8be601525f4333d~mv2.gif'
                )
                .setTimestamp();
            if (Channel) {
                Channel.send({ embeds: [lockEmbed] });
                return interaction.reply('Yay! Channel has been locked.');
            }
        }
        if (state === 'unlock') {
            Channel.permissionOverwrites.edit(role, { SEND_MESSAGES: true }); // or 'null'})
        }
        const unlockEmbed = new MessageEmbed()
            .setDescription(`Channel unlocked by ${interaction.user.tag}`)
            .addField('**Reason:**', `${reason}`)
            .setColor('#ff9913')
            .setTimestamp();
        if (Channel) {
            Channel.send({ embeds: [unlockEmbed] });
            return interaction.reply('Yay! Channel has been unlocked.');
        }
    },
};
