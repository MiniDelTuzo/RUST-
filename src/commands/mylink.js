/*
    RustPlusPlus - Check current Discord to Steam ID account link
*/

const Builder = require('@discordjs/builders');

module.exports = {
    name: 'mylink',

    getData(client, guildId) {
        return new Builder.SlashCommandBuilder()
            .setName('mylink')
            .setDescription('Muestra tu vinculación actual entre Discord y Steam');
    },

    async execute(client, interaction) {
        try {
            const guildId = interaction.guildId;
            const instance = client.getInstance(guildId);
            
            if (!instance) {
                await client.interactionReply(interaction, {
                    content: '❌ Error: No se pudo obtener la configuración del servidor.',
                    ephemeral: true
                });
                return;
            }

            const steamIdToDiscord = instance.steamIdToDiscord || {};
            const discordId = interaction.user.id;

            // Buscar el Steam ID vinculado a este Discord ID
            let linkedSteamId = null;
            for (const [steamId, data] of Object.entries(steamIdToDiscord)) {
                if (data.discordId === discordId) {
                    linkedSteamId = steamId;
                    break;
                }
            }

            if (!linkedSteamId) {
                await client.interactionReply(interaction, {
                    content: '❌ No estás vinculado. Usa `/link <tu-codigo>` para vincularte.',
                    ephemeral: true
                });
                return;
            }

            const linkData = steamIdToDiscord[linkedSteamId];
            const linkedDate = new Date(linkData.linkedAt).toLocaleDateString('es-ES');

            await client.interactionReply(interaction, {
                content: `✅ **Tu Vinculación**\n\n` +
                         `📛 Discord: ${interaction.user.tag}\n` +
                         `🎮 Steam ID: \`${linkedSteamId}\`\n` +
                         `📅 Vinculado: ${linkedDate}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in mylink command:', error);
            try {
                await client.interactionReply(interaction, {
                    content: '❌ Error al procesar el comando. Intenta de nuevo.',
                    ephemeral: true
                });
            } catch (replyError) {
                console.error('Failed to reply to interaction:', replyError);
            }
        }
    },
};
