/*
    RustPlusPlus - Setup Link Account message with embed and button
*/

const Builder = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
    name: 'setuplink',

    getData(client, guildId) {
        return new Builder.SlashCommandBuilder()
            .setName('setuplink')
            .setDescription('Envía un embed con botón para vincular cuentas (Admin only)');
    },

    async execute(client, interaction) {
        const verifyId = Math.floor(100000 + Math.random() * 900000);
        client.logInteraction(interaction, verifyId, 'slashCommand');

        if (!await client.validatePermissions(interaction)) return;

        try {
            // Crear el embed
            const embed = new Discord.EmbedBuilder()
                .setColor('#FF6B35')
                .setTitle('🔗 Vincula tu Cuenta')
                .setDescription('Conecta tu cuenta de Discord con tu cuenta de Rust para usar los comandos de voz del equipo.')
                .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
                .addFields(
                    {
                        name: '¿Cómo funciona?',
                        value: '1. Escribe `!link` en Rust\n2. Copia el código que recibes\n3. Haz clic en el botón de abajo\n4. Pega el código en el modal'
                    },
                    {
                        name: '¿Qué pasa cuando me vinculo?',
                        value: '✅ Tu apodo cambia a tu nombre de Rust\n✅ Recibes el rol de "Linked"\n✅ Puedes usar comandos de voz'
                    }
                )
                .setFooter({ text: 'RustPlusPlus | Válido por 10 minutos' });

            // Crear el botón
            const linkButton = new Discord.ButtonBuilder()
                .setCustomId('link_account_button')
                .setLabel('🔗 Link My Account')
                .setStyle(Discord.ButtonStyle.Success);

            const unlinkButton = new Discord.ButtonBuilder()
                .setCustomId('unlink_account_button')
                .setLabel('🔓 Unlink My Account')
                .setStyle(Discord.ButtonStyle.Danger);

            // Crear action row
            const row = new Discord.ActionRowBuilder().addComponents(linkButton, unlinkButton);

            // Enviar el mensaje
            await interaction.channel.send({
                embeds: [embed],
                components: [row]
            });

            await client.interactionReply(interaction, {
                content: '✅ Embed de vinculación enviado correctamente.',
                ephemeral: true
            });

            client.log(client.intlGet(null, 'infoCap'), 'Link account embed sent to channel');
        } catch (error) {
            console.error('Error in setuplink command:', error);
            await client.interactionReply(interaction, {
                content: '❌ Error al enviar el embed.',
                ephemeral: true
            });
        }
    },
};
