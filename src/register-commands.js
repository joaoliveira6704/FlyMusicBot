require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'help',
        description: 'Mostra o que cada comando faz!',
    },
    {
        name: 'join',
        description: 'Entra no canal de voz!',
    },
    {
        name: 'leave',
        description: 'Sai do canal de voz!',
    },
    {
        name: 'judas',
        description: 'Toca a música Judas!',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log('Slash commands were registered successfully!');
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();