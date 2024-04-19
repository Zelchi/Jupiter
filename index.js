import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, messageLink } from "discord.js";
import * as dotenv from "dotenv";
import { rolar } from "./utilidades/rolagemdedados.js";
import { criarPerfil } from "./utilidades/criadorDePerfil.js";
import admin from "firebase-admin";

dotenv.config();

admin.initializeApp({
    credential: admin.credential.cert("firebase.json")
});

const bancoDados = admin.firestore();

const config = {
    prefix: "!",
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.login(process.env.TOKEN);

// Registrar comandos
const perfis = {};
const comandos = new Map();

function registrarComando(nome, argumento) {
    comandos.set(nome, argumento);
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content.match("```")) return;

    // Sistema de Rolagem de dados.
    const diceRollRegex = /^!(\d+d\d+)([+-]\d+)?$/i;
    const diceRollMatch = message.content.match(diceRollRegex);

    if (diceRollMatch) {
        // Passa a string completa da rolagem de dados para a função rolar
        rolar(message, bancoDados, [diceRollMatch[0].slice(1)]);
        return;
    }

    if (message.content.startsWith(config.prefix)) {
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const comando = comandos.get(commandName);
        if (comando) {
            try {
                // Verifica se o comando é uma função antes de chamar execute
                if (typeof comando === 'function') {
                    await comando(message, args);
                } else {
                    await comando.execute(message, args);
                }
            } catch (error) {
                console.error(error);
                message.reply('Ocorreu um erro ao executar o comando.');
            }
        }
    }
});

// Criador de perfil
registrarComando("registrar", async (message) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();

    if (verificarPerfil.exists) {
        message.reply('Seu perfil já foi criado!');
    } else {
        criarPerfil(message, bancoDados);
    }
});

// Comando !deletarperfil // !maindelete
registrarComando("apagar", async (message) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (verificarPerfil.exists) {
        await bancoDados.collection('perfis').doc(message.author.id).delete();
        message.reply('Seu perfil foi excluído com sucesso.');
    } else {
        message.reply('Você não tem um perfil para excluir.');
    }
});

registrarComando("perfil", async (message) => {
    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;

    const verificarPerfil = await bancoDados.collection('perfis').doc(usuarioId).get();
    if (verificarPerfil.exists) {
        const perfil = verificarPerfil.data();
        const embedPerfil = new EmbedBuilder()
            .setColor(perfil.cor)
            .setTitle(`${perfil.nomePersonagem}`)
            .setImage(`${perfil.foto}`);

        await message.channel.send({ embeds: [embedPerfil] });
    } else {
        if (verificarUsuario) {
            message.reply(`O perfil de ${verificarUsuario.username} ainda não foi criado.`)
        } else {
            message.reply('Seu perfil ainda não foi criado.')
        }
    }
});