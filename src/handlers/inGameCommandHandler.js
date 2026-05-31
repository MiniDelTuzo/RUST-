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

const SmartAlarmHandler = require('./smartAlarmHandler.js');
const SmartSwitchGroupHandler = require('./smartSwitchGroupHandler.js');
const SmartSwitchHandler = require('./smartSwitchHandler.js');
const Discord = require('discord.js');

async function handleVoiceCommand(rustplus, client, instance, callerSteamId, callerName, voiceCommandName) {
    const voiceChannels = instance.voiceChannels || {};
    const steamIdToDiscord = instance.steamIdToDiscord || {};
    const channelId = voiceChannels[voiceCommandName];

    console.log(`[VOICE] Command: ${voiceCommandName}, ChannelId: ${channelId}`);

    if (!channelId) {
        rustplus.sendInGameMessage(`❌ Comando de voz no configurado: \`!${voiceCommandName}\``);
        return;
    }

    const guild = client.guilds.cache.get(rustplus.guildId);
    if (!guild) {
        console.log(`[VOICE] Guild not found: ${rustplus.guildId}`);
        rustplus.sendInGameMessage(`❌ No se pudo encontrar el servidor Discord.`);
        return;
    }

    const channel = guild.channels.cache.get(channelId);
    console.log(`[VOICE] Channel found: ${!!channel}, Type: ${channel?.type}`);
    
    if (!channel) {
        rustplus.sendInGameMessage(`❌ El canal para \`!${voiceCommandName}\` ya no existe o no es válido.`);
        return;
    }

    // Validar que sea canal de voz (tipo 2)
    if (channel.type !== 2) {
        console.log(`[VOICE] Channel type mismatch. Expected 2, got ${channel.type}`);
        rustplus.sendInGameMessage(`❌ El canal para \`!${voiceCommandName}\` no es un canal de voz válido.`);
        return;
    }

    try {
        // Buscar al usuario por Steam ID
        const steamIdStr = callerSteamId.toString();
        const linkData = steamIdToDiscord[steamIdStr];

        console.log(`[VOICE] Looking for linked user: ${steamIdStr}, Found: ${!!linkData}`);

        if (!linkData) {
            rustplus.sendInGameMessage(`❌ ${callerName}, debes vincularte primero con \`/link <código>\` en Discord.`);
            return;
        }

        const discordId = linkData.discordId;

        // Obtener el miembro de Discord
        let member;
        try {
            member = await guild.members.fetch(discordId);
            console.log(`[VOICE] Member found: ${!!member}, Username: ${member?.user.username}`);
        } catch (error) {
            console.log(`[VOICE] Member fetch error:`, error.message);
            rustplus.sendInGameMessage(`❌ No se encontró a ${callerName} en el servidor Discord.`);
            return;
        }

        if (!member) {
            rustplus.sendInGameMessage(`❌ No se encontró a ${callerName} en el servidor Discord.`);
            return;
        }

        // Mover al usuario al canal de voz
        console.log(`[VOICE] Moving member ${member.user.username} to channel ${channel.name}`);
        await member.voice.setChannel(channel);
        console.log(`[VOICE] ✅ Member moved successfully`);
        
        rustplus.sendInGameMessage(`✅ ${callerName} se movió a **${channel.name}**`);
    } catch (error) {
        console.error('[VOICE] Error moving user to voice channel:', error);
        rustplus.sendInGameMessage(`❌ No se pudo mover a ${callerName} al canal de voz.`);
    }
}

module.exports = {
    inGameCommandHandler: async function (rustplus, client, message) {
        const guildId = rustplus.guildId;
        const instance = client.getInstance(guildId);

        let command = message.broadcast.teamMessage.message.message;
        for (const alias of instance.aliases) {
            command = command.replace(alias.alias, alias.value);
        }

        const callerSteamId = message.broadcast.teamMessage.message.steamId.toString();
        const callerName = message.broadcast.teamMessage.message.name;
        const commandLowerCase = command.toLowerCase();
        const prefix = rustplus.generalSettings.prefix;

        if (!rustplus.isOperational) {
            return false;
        }
        else if (!rustplus.generalSettings.inGameCommandsEnabled) {
            return false;
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxAfk')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxAfk')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandAfk());
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxAlive')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxAlive')}`)) {
            rustplus.sendInGameMessage(rustplus.getCommandAlive(command));
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxCargo')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxCargo')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandCargo());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxChinook')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxChinook')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandChinook());
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxConnection')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxConnections')}`)) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxConnection')} `) ||
                commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxConnections')}`))) {
            rustplus.sendInGameMessage(rustplus.getCommandConnection(command));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxCraft')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxCraft')}`)) {
            rustplus.sendInGameMessage(rustplus.getCommandCraft(command));
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxDeath')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxDeaths')}`)) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxDeath')} `) ||
                commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxDeaths')}`))) {
            rustplus.sendInGameMessage(await rustplus.getCommandDeath(command, callerSteamId));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxDecay')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxDecay')}`)) {
            rustplus.sendInGameMessage(rustplus.getCommandDecay(command));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxDespawn')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxDespawn')}`)) {
            rustplus.sendInGameMessage(rustplus.getCommandDespawn(command));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxEvents')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxEvents')}`)) {
            rustplus.sendInGameMessage(rustplus.getCommandEvents(command));
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxHeli')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxHeli')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandHeli());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxLarge')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxLarge')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandLarge());
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxLeader')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxLeader')}`)) {
            rustplus.sendInGameMessage(await rustplus.getCommandLeader(command, callerSteamId));
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxMarker')} `) ||
            commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxMarkers')}`) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxMarker')} `) ||
                commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxMarkers')}`)) {
            rustplus.sendInGameMessage(await rustplus.getCommandMarker(command, callerSteamId));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxMarket')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxMarket')} `)) {
            rustplus.sendInGameMessage(rustplus.getCommandMarket(command));
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxMute')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxMute')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandMute());
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxNote')} `) ||
            commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxNotes')}`) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxNote')} `) ||
                commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxNotes')}`)) {
            rustplus.sendInGameMessage(rustplus.getCommandNote(command));
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxOffline')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxOffline')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandOffline());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxOnline')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxOnline')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandOnline());
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxPlayer')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxPlayers')}`)) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxPlayer')} `) ||
                commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxPlayers')}`))) {
            rustplus.sendInGameMessage(rustplus.getCommandPlayer(command));
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxPop')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxPop')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandPop());
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxProx')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxProx')}`)) {
            rustplus.sendInGameMessage(await rustplus.getCommandProx(command, callerSteamId));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxRecycle')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxRecycle')}`)) {
            rustplus.sendInGameMessage(rustplus.getCommandRecycle(command));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxResearch')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxResearch')}`)) {
            rustplus.sendInGameMessage(rustplus.getCommandResearch(command));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxSend')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxSend')} `)) {
            rustplus.sendInGameMessage(await rustplus.getCommandSend(command, callerName));
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxSmall')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxSmall')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandSmall());
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxStack')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxStack')}`)) {
            rustplus.sendInGameMessage(await rustplus.getCommandStack(command));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxSteamid')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxSteamid')}`)) {
            rustplus.sendInGameMessage(await rustplus.getCommandSteamId(command, callerSteamId, callerName));
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxTeam')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxTeam')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandTeam());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxTime')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxTime')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandTime());
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxTimer')} `) ||
            commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxTimers')}`) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxTimer')} `) ||
                commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxTimers')}`)) {
            rustplus.sendInGameMessage(rustplus.getCommandTimer(command));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxTranslateTo')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxTranslateTo')} `)) {
            rustplus.sendInGameMessage(await rustplus.getCommandTranslateTo(command));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxTranslateFromTo')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxTranslateFromTo')} `)) {
            rustplus.sendInGameMessage(await rustplus.getCommandTranslateFromTo(command));
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxTTS')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxTTS')} `)) {
            rustplus.sendInGameMessage(await rustplus.getCommandTTS(command, callerName));
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxUnmute')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxUnmute')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandUnmute());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxUpkeep')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxUpkeep')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandUpkeep());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxUptime')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxUptime')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandUptime());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxWipe')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxWipe')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandWipe());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxLeaderboardPlaytime')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxLeaderboardPlaytime')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandLeaderboardPlaytime());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxLeaderboardLogins')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxLeaderboardLogins')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandLeaderboardLogins());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxLeaderboardOldest')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxLeaderboardOldest')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandLeaderboardOldest());
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxTravelingVendor')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxTravelingVendor')}`) {
            rustplus.sendInGameMessage(rustplus.getCommandTravelingVendor());
        }
        else if (commandLowerCase === `${prefix}link`) {
            /* Link Discord account - generate linking code */
            if (!instance.linkingCodes) {
                instance.linkingCodes = {};
            }

            // Limpiar códigos expirados
            const now = Date.now();
            for (const [code, data] of Object.entries(instance.linkingCodes)) {
                if (now - data.createdAt > 10 * 60 * 1000) {
                    delete instance.linkingCodes[code];
                }
            }

            // Generar nuevo código
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // Guardar el código con Steam ID y timestamp (expira en 10 minutos)
            instance.linkingCodes[code] = {
                steamId: callerSteamId.toString(),
                createdAt: Date.now()
            };

            rustplus.sendInGameMessage(code);
            
            client.log(client.intlGet(null, 'infoCap'), `Link code generated for ${callerName} (${callerSteamId}): ${code}`);
        }
        else if (commandLowerCase === `${prefix}unlink`) {
            /* Unlink Discord account */
            if (!instance.steamIdToDiscord) {
                instance.steamIdToDiscord = {};
            }

            const steamIdStr = callerSteamId.toString();
            const linkData = instance.steamIdToDiscord[steamIdStr];

            if (!linkData) {
                rustplus.sendInGameMessage(`❌ No estás vinculado a ninguna cuenta.`);
                return;
            }

            delete instance.steamIdToDiscord[steamIdStr];
            client.setInstance(rustplus.guildId, instance);

            rustplus.sendInGameMessage(`✅ Desvinculación completada.`);
            client.log(client.intlGet(null, 'infoCap'), `${callerName} (${callerSteamId}) unlinked`);

            // Enviar log al canal configurado
            if (instance.linkLogChannelId) {
                const guild = client.guilds.cache.get(rustplus.guildId);
                const logChannel = guild.channels.cache.get(instance.linkLogChannelId);
                if (logChannel && logChannel.isTextBased()) {
                    const Discord = require('discord.js');
                    const logEmbed = new Discord.EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🔓 Cuenta Desvinculada (desde Rust)')
                        .addFields(
                            { name: '👤 Nombre en Rust', value: callerName, inline: true },
                            { name: '🎮 Steam ID', value: `\`${steamIdStr}\``, inline: true },
                            { name: '⏰ Hora', value: new Date().toLocaleString('es-ES'), inline: false }
                        )
                        .setFooter({ text: 'RustPlusPlus Link Logs' })
                        .setTimestamp();

                    logChannel.send({ embeds: [logEmbed] }).catch(err => {
                        console.error('Error sending unlink log:', err);
                    });
                }
            }
        }
        else if (commandLowerCase.startsWith(prefix) && commandLowerCase.length > prefix.length) {
            /* Check if it's a voice channel command */
            const voiceCommandName = commandLowerCase.substring(prefix.length);
            const voiceChannels = instance.voiceChannels || {};
            
            if (voiceChannels[voiceCommandName]) {
                await handleVoiceCommand(rustplus, client, instance, callerSteamId, callerName, voiceCommandName);
            }
            else {
                /* Maybe a custom command? */

                if (SmartAlarmHandler.smartAlarmCommandHandler(rustplus, client, command)) {
                    rustplus.logInGameCommand('Smart Alarm', message);
                    return true;
                }

                if (await SmartSwitchHandler.smartSwitchCommandHandler(rustplus, client, command)) {
                    rustplus.logInGameCommand('Smart Switch', message);
                    return true;
                }

                if (await SmartSwitchGroupHandler.smartSwitchGroupCommandHandler(rustplus, client, command)) {
                    rustplus.logInGameCommand('Smart Switch Group', message);
                    return true;
                }

                return false;
            }
        }

        rustplus.logInGameCommand('Default', message);

        return true;
    },
};
