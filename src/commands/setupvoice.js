/*
    RustPlusPlus - Setup multiple voice channels at once
*/

const Builder = require('@discordjs/builders');

module.exports = {
    getData: function(client, guildId) {
        return new Builder.SlashCommandBuilder()
            .setName('setupvoice')
            .setDescription('Configura rápidamente los canales de voz (Admin only)')
            .addStringOption(option =>
                option
                    .setName('config')
                    .setDescription('Paste los canales en formato: nombre:id nombre:id')
                    .setRequired(true)
            );
    },

    execute: async function(client, interaction) {
        const guildId = interaction.guildId;
        const instance = client.getInstance(guildId);

        // Verificar permisos de admin
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            await client.interactionReply(interaction, {
                content: '❌ Solo administradores pueden usar este comando.',
                ephemeral: true
            });
            return;
        }

        const configStr = interaction.options.getString('config');

        // Inicializar objeto si no existe
        if (!instance.voiceChannels) {
            instance.voiceChannels = {};
        }

        try {
            // Parsear formato: "voz1:1328328679872401515 voz2:1463716133159833682"
            const pairs = configStr.trim().split(/\s+/);
            let successCount = 0;
            let errors = [];

            for (const pair of pairs) {
                const [name, id] = pair.split(':');
                
                if (!name || !id) {
                    errors.push(`❌ Formato incorrecto: ${pair}`);
                    continue;
                }

                // Validar que el ID sea válido
                if (!/^\d+$/.test(id)) {
                    errors.push(`❌ ID inválido: ${id}`);
                    continue;
                }

                // Verificar que el canal existe
                const guild = client.guilds.cache.get(guildId);
                const channel = guild.channels.cache.get(id);

                if (!channel) {
                    errors.push(`❌ Canal no encontrado: ${name} (${id})`);
                    continue;
                }

                if (channel.type !== 2) { // 2 = Voice Channel
                    errors.push(`❌ ${name} no es un canal de voz`);
                    continue;
                }

                // Guardar el canal
                instance.voiceChannels[name.toLowerCase()] = id;
                successCount++;
            }

            // Compilar respuesta
            let response = `✅ Configuración completada!\n\n`;
            response += `**Canales configurados:** ${successCount}\n`;

            if (successCount > 0) {
                response += `\n**Canales activos:**\n`;
                for (const [name, id] of Object.entries(instance.voiceChannels)) {
                    const channel = client.guilds.cache.get(guildId).channels.cache.get(id);
                    if (channel) {
                        response += `• \`!${name}\` → <#${id}>\n`;
                    }
                }
            }

            if (errors.length > 0) {
                response += `\n**Errores:**\n${errors.join('\n')}`;
            }

            await client.interactionReply(interaction, {
                content: response,
                ephemeral: true
            });

            client.log(client.intlGet(null, 'infoCap'), `Voice channels configured: ${successCount} channels`);

        } catch (error) {
            console.error('Error in setupvoice command:', error);
            await client.interactionReply(interaction, {
                content: '❌ Error al configurar los canales. Verifica el formato.',
                ephemeral: true
            });
        }
    },
};
