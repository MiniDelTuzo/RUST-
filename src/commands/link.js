/*
    RustPlusPlus - Link Discord account using a code from in-game

    Players use !link in-game to get a code, then /link <code> in Discord
*/

const Builder = require('@discordjs/builders');

// Helper function to generate random code
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
    name: 'link',

    getData(client, guildId) {
        return new Builder.SlashCommandBuilder()
            .setName('link')
            .setDescription('Vincula tu cuenta de Discord a Rust usando el código del juego')
            .addStringOption(option =>
                option
                    .setName('codigo')
                    .setDescription('El código que recibiste con !link en Rust')
                    .setRequired(true)
            );
    },

    async execute(client, interaction) {
        try {
            console.log('📍 Link command started');
            
            const guildId = interaction.guildId;
            console.log('📍 Guild ID:', guildId);
            
            const instance = client.getInstance(guildId);
            console.log('📍 Instance:', !!instance);
            
            if (!instance) {
                console.log('❌ No instance found');
                await interaction.reply({
                    content: '❌ Error: No se pudo obtener la configuración del servidor.',
                    ephemeral: true
                });
                return;
            }

            const code = interaction.options.getString('codigo').toUpperCase().trim();
            console.log('📍 Code entered:', code);
            
            const discordId = interaction.user.id;
            const discordTag = interaction.user.tag;

            // Inicializar objetos si no existen
            if (!instance.linkingCodes) {
                instance.linkingCodes = {};
            }
            if (!instance.steamIdToDiscord) {
                instance.steamIdToDiscord = {};
            }

            // Buscar el código
            console.log('📍 Looking for code in linking codes');
            const codeData = instance.linkingCodes[code];
            console.log('📍 Code data:', !!codeData);

            if (!codeData) {
                console.log('❌ Code not found');
                await interaction.reply({
                    content: '❌ Código inválido o expirado. Usa `!link` en Rust para obtener un nuevo código.',
                    ephemeral: true
                });
                return;
            }

            // Verificar que el código no haya expirado (10 minutos)
            const now = Date.now();
            const age = now - codeData.createdAt;
            console.log('📍 Code age:', age, 'ms');
            
            if (age > 10 * 60 * 1000) {
                console.log('❌ Code expired');
                delete instance.linkingCodes[code];
                await interaction.reply({
                    content: '❌ El código expiró. Usa `!link` en Rust para obtener un nuevo código.',
                    ephemeral: true
                });
                return;
            }

            // Vincular el Steam ID al Discord ID
            const steamId = codeData.steamId;
            console.log('📍 Linking Steam ID:', steamId);
            
            instance.steamIdToDiscord[steamId] = {
                discordId: discordId,
                linkedAt: new Date().toISOString(),
                discordTag: discordTag
            };

            // Eliminar el código usado
            delete instance.linkingCodes[code];
            console.log('✅ Linking successful');

            await interaction.reply({
                content: `✅ ¡Vinculación completada!\n\n` +
                         `🎮 Steam ID: \`${steamId}\`\n` +
                         `📛 Discord: **${discordTag}**\n\n` +
                         `Ya puedes usar comandos de voz: \`!voz1\`, \`!voz2\`, etc.`,
                ephemeral: true
            });

            console.log('✅ Reply sent');
        } catch (error) {
            console.error('❌ ERROR in link command:', error);
            try {
                await interaction.reply({
                    content: '❌ Error al procesar el comando. Intenta de nuevo.',
                    ephemeral: true
                });
            } catch (replyError) {
                console.error('❌ Failed to reply:', replyError);
            }
        }
    },
};
