/*
    Copyright (C) 2022 Alexander Emanuelsson (alexemanuelol)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    https://github.com/alexemanuelol/rustplusplus

*/

const Builder = require('@discordjs/builders');

module.exports = {
    name: 'voicechannels',

    getData(client, guildId) {
        return new Builder.SlashCommandBuilder()
            .setName('voicechannels')
            .setDescription('Administrar canales de voz para comandos !voice')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Añadir un canal de voz')
                    .addStringOption(option =>
                        option
                            .setName('id')
                            .setDescription('ID del canal de Discord')
                            .setRequired(true))
                    .addStringOption(option =>
                        option
                            .setName('nombre')
                            .setDescription('Nombre para el comando (!voice, !voz1, !voz2, etc)')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remover un canal de voz')
                    .addStringOption(option =>
                        option
                            .setName('nombre')
                            .setDescription('Nombre del canal a remover')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('list')
                    .setDescription('Ver todos los canales configurados'));
    },

    async execute(client, interaction) {
        const verifyId = Math.floor(100000 + Math.random() * 900000);
        client.logInteraction(interaction, verifyId, 'slashCommand');

        if (!await client.validatePermissions(interaction)) return;

        const subcommand = interaction.options.getSubcommand();
        const instance = client.getInstance(interaction.guildId);

        if (!instance.voiceChannels) {
            instance.voiceChannels = {};
        }

        if (subcommand === 'add') {
            const channelId = interaction.options.getString('id');
            const nombre = interaction.options.getString('nombre').toLowerCase();

            // Validar que sea un ID válido
            if (!/^\d+$/.test(channelId)) {
                await client.interactionReply(interaction, {
                    content: '❌ El ID del canal no es válido. Debe ser un número.',
                    ephemeral: true
                });
                return;
            }

            // Verificar que el canal existe en Discord
            const channel = interaction.guild.channels.cache.get(channelId);
            if (!channel) {
                await client.interactionReply(interaction, {
                    content: `❌ No encontré ningún canal con ID: \`${channelId}\`\n\n💡 **Cómo obtener el ID:**\n1. Click derecho en el canal\n2. Copiar ID del usuario/canal`,
                    ephemeral: true
                });
                return;
            }

            if (channel.type !== 2) { // ChannelType.Voice = 2
                await client.interactionReply(interaction, {
                    content: `❌ <#${channelId}> no es un canal de voz.`,
                    ephemeral: true
                });
                return;
            }

            // Guardar configuración
            instance.voiceChannels[nombre] = channelId;
            client.setInstance(interaction.guildId, instance);

            await client.interactionReply(interaction, {
                content: `✅ **Canal agregado**\n\n**Nombre:** \`${nombre}\`\n**Canal:** <#${channelId}>\n\nAhora puedes usar \`!${nombre}\` desde el chat de equipo.`,
                ephemeral: true
            });

            client.log(client.intlGet(null, 'infoCap'), `Voice channel added: ${nombre} -> ${channelId}`);
        }
        else if (subcommand === 'remove') {
            const nombre = interaction.options.getString('nombre').toLowerCase();

            if (!instance.voiceChannels[nombre]) {
                await client.interactionReply(interaction, {
                    content: `❌ No existe canal configurado con el nombre: \`${nombre}\``,
                    ephemeral: true
                });
                return;
            }

            const channelId = instance.voiceChannels[nombre];
            delete instance.voiceChannels[nombre];
            client.setInstance(interaction.guildId, instance);

            await client.interactionReply(interaction, {
                content: `✅ **Canal removido**\n\n**Nombre:** \`${nombre}\`\n**Canal ID:** \`${channelId}\``,
                ephemeral: true
            });

            client.log(client.intlGet(null, 'infoCap'), `Voice channel removed: ${nombre}`);
        }
        else if (subcommand === 'list') {
            const channels = instance.voiceChannels || {};
            const channelCount = Object.keys(channels).length;

            if (channelCount === 0) {
                await client.interactionReply(interaction, {
                    content: `❌ No hay canales configurados.\n\nUsa \`/voicechannels add <id> <nombre>\` para añadir uno.`,
                    ephemeral: true
                });
                return;
            }

            let list = '🎤 **Canales de Voz Configurados:**\n\n';
            for (const [nombre, channelId] of Object.entries(channels)) {
                const channel = interaction.guild.channels.cache.get(channelId);
                const channelName = channel ? channel.name : 'Canal no encontrado';
                list += `✅ \`!${nombre}\` → <#${channelId}> (${channelName})\n`;
            }

            list += `\n**Total:** ${channelCount} canal(es)`;

            await client.interactionReply(interaction, {
                content: list,
                ephemeral: true
            });

            client.log(client.intlGet(null, 'infoCap'), `Voice channels list shown: ${channelCount} channels`);
        }
    },
};
