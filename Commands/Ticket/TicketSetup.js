const {
    MessageEmbed,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} = require('discord.js');
const DB = require('../../Structures/Schemas/TicketSetup');

module.exports = {
    name: 'ticketsetup',
    description: 'Creates a ticket.',
    usage: '/ticket',
    permissions: ['ADMINISTRATOR'],
    cooldown: 10000,
    options: [
        {
            name: 'channel',
            description: 'Select the ticket creation channel.',
            required: true,
            type: 'CHANNEL',
            channelType: ['GUILD_TEXT'],
        },
        {
            name: 'category',
            description: 'Select the ticket channel creation category.',
            required: true,
            type: 'CHANNEL',
            channelType: ['GUILD_CATEGORY'],
        },
        {
            name: 'transcripts',
            description: 'Select the channel for ticket transcripts.',
            required: true,
            type: 'CHANNEL',
            channelType: ['GUILD_TEXT'],
        },
        {
            name: 'handlers',
            description: 'Select the ticket handlers role.',
            required: true,
            type: 'ROLE',
        },
        {
            name: 'description',
            description:
                'Select the description of the ticket creation channel.',
            required: true,
            type: 'STRING',
        },
        {
            name: 'firstbuttons',
            description:
                'Give your first button a name and add an emoji by adding a comma followed by the emoji',
            required: true,
            type: 'STRING',
        },
        {
            name: 'secondbuttons',
            description:
                'Give your second button a name and add an emoji by adding a comma followed by the emoji',
            required: true,
            type: 'STRING',
        },
        {
            name: 'thirdbuttons',
            description:
                'Give your third button a name and add an emoji by adding a comma followed by the emoji',
            required: true,
            type: 'STRING',
        },
    ],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, options } = interaction;

        try {
            //* Getting the args
            const Channel = options.getChannel('channel');
            const Category = options.getChannel('category');
            const Transcripts = options.getChannel('transcripts');
            const Handlers = options.getRole('handlers');

            const Description = options.getString('description');

            const Button1 = options.getString('firstbuttons').split(',');
            const Button2 = options.getString('secondbuttons').split(',');
            const Button3 = options.getString('thirdbuttons').split(',');

            const Emoji1 = Button1[1];
            const Emoji2 = Button2[1];
            const Emoji3 = Button3[1];

            //* Checking db for guild
            await DB.findOneAndUpdate(
                { GuildID: guild.id },
                {
                    Channel: Channel.id,
                    Category: Category.id,
                    Transcripts: Transcripts.id,
                    Handlers: Handlers.id,
                    Description: Description,
                    Buttons: [Button1[0], Button2[0], Button3[0]],
                },
                {
                    new: true,
                    upsert: true,
                }
            );

            const Buttons = new MessageActionRow();
            Buttons.addComponents(
                new MessageButton()
                    .setCustomId(Button1[0])
                    .setLabel(Button1[0])
                    .setStyle('PRIMARY')
                    .setEmoji(Emoji1),
                new MessageButton()
                    .setCustomId(Button2[0])
                    .setLabel(Button2[0])
                    .setStyle('PRIMARY')
                    .setEmoji(Emoji2),
                new MessageButton()
                    .setCustomId(Button3[0])
                    .setLabel(Button3[0])
                    .setStyle('PRIMARY')
                    .setEmoji(Emoji3)
            );

            const Embed = new MessageEmbed()
                .setAuthor({
                    name: guild.name + '| Ticketing System',
                    iconURL: guild.iconURL({ dynamic: true }),
                })
                .setDescription(Description)
                .setColor(color.default);

            await guild.channels.cache
                .get(Channel.id)
                .send({ embeds: [Embed], components: [Buttons] });

            interaction.reply({ content: 'Ticket created !', ephemeral: true });
        } catch (err) {
            const errEmbed = new MessageEmbed().setColor(color.error)
                .setDescription(`⛔ | An error occured while creating the ticket.\n**What to make sure of ?**
                1. Make sure none of your buttons name are duplicated.
                2. Make sure you use this format for your buttons -> Name,Emoji
                3. Make sure your button names are not longer than 200 characters.
                4. Make sure your button emojis, are acctually emojis.`);
            interaction.reply({ embeds: [errEmbed] });
        }
    },
};
