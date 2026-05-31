/*
	Copyright (C) 2023 Alexander Emanuelsson (alexemanuelol)

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

const Constants = require('../util/constants.js');
const DiscordEmbeds = require('../discordTools/discordEmbeds.js');
const DiscordTools = require('../discordTools/discordTools.js');

module.exports = {
	name: 'leaderboard',

	getData(client, guildId) {
		return new Builder.SlashCommandBuilder()
			.setName('leaderboard')
			.setDescription(client.intlGet(guildId, 'commandsLeaderboardDesc'))
			.addSubcommand(subcommand => subcommand
				.setName('playtime')
				.setDescription(client.intlGet(guildId, 'commandsLeaderboardPlaytimeDesc'))
				.addStringOption(option => option
					.setName('battlemetricsid')
					.setDescription(client.intlGet(guildId, 'commandsPlayersBattlemetricsIdDesc'))
					.setRequired(false)))
			.addSubcommand(subcommand => subcommand
				.setName('logins')
				.setDescription(client.intlGet(guildId, 'commandsLeaderboardLoginsDesc'))
				.addStringOption(option => option
					.setName('battlemetricsid')
					.setDescription(client.intlGet(guildId, 'commandsPlayersBattlemetricsIdDesc'))
					.setRequired(false)))
			.addSubcommand(subcommand => subcommand
				.setName('oldest')
				.setDescription(client.intlGet(guildId, 'commandsLeaderboardOldestDesc'))
				.addStringOption(option => option
					.setName('battlemetricsid')
					.setDescription(client.intlGet(guildId, 'commandsPlayersBattlemetricsIdDesc'))
					.setRequired(false)));
	},

	async execute(client, interaction) {
		const verifyId = Math.floor(100000 + Math.random() * 900000);
		client.logInteraction(interaction, verifyId, 'slashCommand');

		if (!await client.validatePermissions(interaction)) return;
		await interaction.deferReply({ ephemeral: true });

		let battlemetricsId = interaction.options.getString('battlemetricsid');

		if (!battlemetricsId) {
			const rustplus = client.rustplusInstances[interaction.guildId];
			if (!rustplus || (rustplus && !rustplus.isOperational)) {
				const str = client.intlGet(interaction.guildId, 'notConnectedToRustServer');
				await client.interactionEditReply(interaction, DiscordEmbeds.getActionInfoEmbed(1, str));
				client.log(client.intlGet(null, 'warningCap'), str);
				return;
			}

			const instance = client.getInstance(interaction.guildId);
			const server = instance.serverList[rustplus.serverId];
			if (!server || (server && !server.battlemetricsId)) {
				const str = client.intlGet(interaction.guildId, 'invalidBattlemetricsId');
				await client.interactionEditReply(interaction, DiscordEmbeds.getActionInfoEmbed(1, str));
				client.log(client.intlGet(null, 'warningCap'), str);
				return;
			}

			battlemetricsId = server.battlemetricsId;
		}

		const bmInstance = client.battlemetricsInstances[battlemetricsId];
		if (!bmInstance || !bmInstance.lastUpdateSuccessful) {
			const str = client.intlGet(interaction.guildId, 'battlemetricsInstanceCouldNotBeFound', {
				id: battlemetricsId
			});
			await client.interactionEditReply(interaction, DiscordEmbeds.getActionInfoEmbed(1, str));
			client.log(client.intlGet(null, 'warningCap'), str);
			return;
		}

		switch (interaction.options.getSubcommand()) {
			case 'playtime': {
				await leaderboardPlaytimeHandler(client, interaction, battlemetricsId);
			} break;

			case 'logins': {
				await leaderboardLoginsHandler(client, interaction, battlemetricsId);
			} break;

			case 'oldest': {
				await leaderboardOldestHandler(client, interaction, battlemetricsId);
			} break;

			default: {
			} break;
		}

		client.log(client.intlGet(null, 'infoCap'), client.intlGet(null, 'slashCommandValueChange', {
			id: `${verifyId}`,
			value: `${interaction.options.getSubcommand()} ${interaction.options.getString('battlemetricsid')} `
		}));
	},
};

async function leaderboardPlaytimeHandler(client, interaction, battlemetricsId) {
	const bmInstance = client.battlemetricsInstances[battlemetricsId];

	// Calculate playtime for each player based on connection logs
	const playerStats = [];

	for (const [playerId, playerData] of Object.entries(bmInstance.players)) {
		let totalPlaytime = 0; // in seconds
		let isCurrentlyOnline = playerData['status'];
		let lastLoginDate = null;

		// Process connection log to calculate total playtime
		for (let i = 0; i < playerData['connectionLog'].length; i++) {
			const currentEntry = playerData['connectionLog'][i];
			const nextEntry = playerData['connectionLog'][i + 1];

			if (currentEntry.data.type === 0) { // Login event
				lastLoginDate = new Date(currentEntry.data.time);

				if (nextEntry && nextEntry.data.type === 1) { // Next is logout
					const logoutDate = new Date(nextEntry.data.time);
					totalPlaytime += (logoutDate - lastLoginDate) / 1000;
				} else if (i === 0 && isCurrentlyOnline) {
					// Currently online, calculate from last login to now
					const now = new Date();
					totalPlaytime += (now - lastLoginDate) / 1000;
				}
			}
		}

		playerStats.push({
			id: playerId,
			name: playerData['name'],
			playtimeSeconds: totalPlaytime,
			isOnline: isCurrentlyOnline
		});
	}

	// Sort by playtime descending
	playerStats.sort((a, b) => b.playtimeSeconds - a.playtimeSeconds);

	// Format and display top 10
	let description = '';
	const top10 = playerStats.slice(0, 10);

	for (let i = 0; i < top10.length; i++) {
		const player = top10[i];
		const hours = Math.floor(player.playtimeSeconds / 3600);
		const minutes = Math.floor((player.playtimeSeconds % 3600) / 60);
		const status = player.isOnline ? '🟢' : '⚫';

		description += `**${i + 1}.** ${status} ${player.name}\n`;
		description += `   └─ ${hours}h ${minutes}m\n\n`;
	}

	const embed = {
		color: Constants.COLOR_ACTIVE,
		title: client.intlGet(interaction.guildId, 'leaderboardPlaytime'),
		description: description || client.intlGet(interaction.guildId, 'noData'),
		footer: { text: `Server: ${bmInstance.server_name}` }
	};

	await client.interactionEditReply(interaction, { embeds: [embed] });
}

async function leaderboardLoginsHandler(client, interaction, battlemetricsId) {
	const bmInstance = client.battlemetricsInstances[battlemetricsId];

	// Count logins for each player
	const playerStats = [];

	for (const [playerId, playerData] of Object.entries(bmInstance.players)) {
		let loginCount = 0;
		let isCurrentlyOnline = playerData['status'];

		// Count login events (type 0)
		for (const entry of playerData['connectionLog']) {
			if (entry.data.type === 0) { // Login event
				loginCount++;
			}
		}

		playerStats.push({
			id: playerId,
			name: playerData['name'],
			logins: loginCount,
			isOnline: isCurrentlyOnline
		});
	}

	// Sort by logins descending
	playerStats.sort((a, b) => b.logins - a.logins);

	// Format and display top 10
	let description = '';
	const top10 = playerStats.slice(0, 10);

	for (let i = 0; i < top10.length; i++) {
		const player = top10[i];
		const status = player.isOnline ? '🟢' : '⚫';

		description += `**${i + 1}.** ${status} ${player.name}\n`;
		description += `   └─ ${player.logins} logins\n\n`;
	}

	const embed = {
		color: Constants.COLOR_ACTIVE,
		title: client.intlGet(interaction.guildId, 'leaderboardLogins'),
		description: description || client.intlGet(interaction.guildId, 'noData'),
		footer: { text: `Server: ${bmInstance.server_name}` }
	};

	await client.interactionEditReply(interaction, { embeds: [embed] });
}

async function leaderboardOldestHandler(client, interaction, battlemetricsId) {
	const bmInstance = client.battlemetricsInstances[battlemetricsId];

	// Get players sorted by first appearance
	const playerStats = [];

	for (const [playerId, playerData] of Object.entries(bmInstance.players)) {
		let firstAppearance = new Date(playerData['createdAt']);
		let isCurrentlyOnline = playerData['status'];

		playerStats.push({
			id: playerId,
			name: playerData['name'],
			firstSeen: firstAppearance,
			isOnline: isCurrentlyOnline
		});
	}

	// Sort by first appearance (oldest first)
	playerStats.sort((a, b) => a.firstSeen - b.firstSeen);

	// Format and display top 10
	let description = '';
	const top10 = playerStats.slice(0, 10);

	for (let i = 0; i < top10.length; i++) {
		const player = top10[i];
		const daysAgo = Math.floor((Date.now() - player.firstSeen) / (1000 * 60 * 60 * 24));
		const status = player.isOnline ? '🟢' : '⚫';

		description += `**${i + 1}.** ${status} ${player.name}\n`;
		description += `   └─ ${daysAgo} days ago\n\n`;
	}

	const embed = {
		color: Constants.COLOR_ACTIVE,
		title: client.intlGet(interaction.guildId, 'leaderboardOldest'),
		description: description || client.intlGet(interaction.guildId, 'noData'),
		footer: { text: `Server: ${bmInstance.server_name}` }
	};

	await client.interactionEditReply(interaction, { embeds: [embed] });
}
