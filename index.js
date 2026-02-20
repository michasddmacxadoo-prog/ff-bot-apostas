const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let salas = [];
let ranking = {};

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'criar') {
    const modo = interaction.options.getString('modo');
    const valor = interaction.options.getInteger('valor');

    const sala = {
      id: salas.length + 1,
      modo,
      valor,
      jogadores: [interaction.user.username],
      status: "aberta"
    };

    salas.push(sala);

    await interaction.reply(`🔥 Sala criada!\nModo: ${modo}\nValor: R$${valor}\nID: ${sala.id}`);
  }

  if (interaction.commandName === 'entrar') {
    const id = interaction.options.getInteger('id');
    const sala = salas.find(s => s.id === id);

    if (!sala) return interaction.reply("Sala não encontrada.");
    if (sala.status !== "aberta") return interaction.reply("Sala já fechada.");

    sala.jogadores.push(interaction.user.username);

    await interaction.reply(`✅ Você entrou na sala ${id}`);
  }

  if (interaction.commandName === 'finalizar') {
    const id = interaction.options.getInteger('id');
    const vencedor = interaction.options.getUser('vencedor');

    const sala = salas.find(s => s.id === id);

    if (!sala) return interaction.reply("Sala não encontrada.");

    sala.status = "finalizada";

    if (!ranking[vencedor.username]) ranking[vencedor.username] = 0;
    ranking[vencedor.username] += 1;

    await interaction.reply(`🏆 ${vencedor.username} venceu a sala ${id}!`);
  }

  if (interaction.commandName === 'ranking') {
    let texto = "🏆 Ranking:\n";
    for (let jogador in ranking) {
      texto += `${jogador}: ${ranking[jogador]} vitórias\n`;
    }
    await interaction.reply(texto || "Sem ranking ainda.");
  }
});

client.login(token);
