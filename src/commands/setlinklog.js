/*
    RustPlusPlus - Set Link Logs Channel
*/

const Builder = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
    name: 'setlinklog',

    getData(client, guildId) {
        return new Builder.SlashCommandBuilder()
            .setName('setlinklog')
            .setDescription('Configura el canal para los logs de vinculación (Admin only)')
            .addChannelOption(option =>
                option
                    .setName('canal')
                    .setDescription('Canal donde se enviarán los logs')
                    .setRequired(true)
            );
    },

    async execute(client, interaction) {
        const verifyId = Math.floor(100000 + Math.random() * 900000);
        client.logInteraction(interaction, verifyId, 'slashCommand');

        if (!await client.validatePermissions(interaction)) return;

        try {
            const channel = interaction.options.getChannel('canal');
            const guildId = interaction.guildId;
            const instance = client.getInstance(guildId);

            // Validar que sea un canal de texto
            if (!channel.isTextBased()) {
                await client.interactionReply(interaction, {
                    content: '❌ El canal debe ser un canal de texto.',
                    ephemeral: true
                });
                return;
            }

            // Guardar el canal
            instance.linkLogChannelId = channel.id;
            client.setInstance(guildId, instance);

            await client.interactionReply(interaction, {
                content: `✅ Canal de logs configurado: <#${channel.id}>\n\nAhora se enviarán logs de vinculación en ese canal.`,
                ephemeral: true
            });

            client.log(client.intlGet(null, 'infoCap'), `Link log channel set to: ${channel.name} (${channel.id})`);
        } catch (error) {
            console.error('Error in setlinklog command:', error);
            await client.interactionReply(interaction, {
                content: '❌ Error al configurar el canal.',
                ephemeral: true
            });
        }
    },
};
