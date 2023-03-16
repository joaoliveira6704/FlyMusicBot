require('dotenv').config();
const { Client, IntentsBitField, ActivityType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates,
    ],
});

client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is online!`);

	client.user.setActivity({
		name: '/help',
		type: ActivityType.Listening,
	});
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

	const channel = interaction.member.voice.channelId;

	if (interaction.commandName === 'help') {
		interaction.reply(`1️⃣ /join - Entra no canal de voz onde o utilizador está!\n\n2️⃣/leave - O bot sai do canal de voz!\n\n▶️ /judas - Toca a música judas!`)
	}

	if (interaction.commandName === 'join') {
		if(!channel){
			interaction.reply('You need to be in a voice channel')
		}
		else{
			const args = interaction.options.getString('query');
			if (!args) {
				interaction.reply('Please provide a valid YouTube link or search query!');
				return;
			}

			await interaction.reply('Joining voice channel and playing the song...');

			const connection = joinVoiceChannel({
				channelId: channel,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});

			try {
				const stream = await ytdl(args);
				const resource = createAudioResource(stream);
				const player = createAudioPlayer({
					pauseOnUnhandledPromise: false,
				});
			
				player.play(resource);
			
				connection.subscribe(player);
			
				player.on(AudioPlayerStatus.Idle, () => {
					console.log('Audio playback has finished.');
					connection.destroy();
				});
	
				player.on('error', (error) => {
					console.error('Audio player error:', error);
				});
	
				player.on('stateChange', (oldState, newState) => {
					console.log(`Audio player state change: ${oldState.status} -> ${newState.status}`);
				});

			} catch (error) {
				console.error(error);
				interaction.editReply('Erro!');
				connection.destroy();
			}
		}
    }

	if (interaction.commandName === 'leave') {
		try{
			getVoiceConnection(interaction.guildId).destroy()

			interaction.reply('A sair...')
		}
		catch (error){
			interaction.reply('O bot precisa de estar num canal de voz para saír!')
		}
	}

	if (interaction.commandName === 'judas') {
		try{
			const connection = joinVoiceChannel({
				channelId: interaction.member.voice.channel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});

			const resource = createAudioResource('./audio/qmd.mp3');
			const player = createAudioPlayer({
				pauseOnUnhandledPromise: false,
			});
			
			player.play(resource);
			
			connection.subscribe(player);
			
			player.on(AudioPlayerStatus.Idle, () => {
				console.log('Audio playback has finished.');
				connection.destroy();
			});
	
			player.on('error', (error) => {
				console.error('Audio player error:', error);
			});
	
			player.on('stateChange', (oldState, newState) => {
				console.log(`Audio player state change: ${oldState.status} -> ${newState.status}`);
			});

			interaction.reply('A reproduzir audio!');
		}
		catch (error) {
			console.log(error)
		}
	}
});

client.login(process.env.TOKEN);