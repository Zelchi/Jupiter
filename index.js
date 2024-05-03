// Captura exceções não tratadas para evitar que o bot desligue
process.on('uncaughtException', (error) => {
    console.error('Exceção não tratada capturada:', error);
    // Aqui você pode decidir se quer desligar o bot ou deixá-lo rodando.
    // É recomendável reiniciar o bot de forma controlada ou notificar alguém sobre o erro.
});

// Captura rejeições de promessas não tratadas para evitar que o bot desligue
process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejeição de promessa não tratada capturada:', promise, 'razão:', reason);
    // Tratamento semelhante ao de exceções não tratadas.
});

import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, messageLink, MessageFlags } from "discord.js";
import * as dotenv from "dotenv";
import { curaVida, danoVida, curaMana, danoMana, curaEnergia, danoEnergia } from "./utilidades/atributos.js";
import { rolar } from "./utilidades/rolagemdedados.js";
import { criarPerfil } from "./utilidades/criadorDePerfil.js";
import { depositarDinheiro, pagarDinheiro, tirarDinheiro } from "./utilidades/dinheiro.js"
import { depositarAstral, pagarAstral } from "./utilidades/astral.js"
import { depositarLevel, pagarLevel } from "./utilidades/level.js"
import admin from "firebase-admin";

dotenv.config();

admin.initializeApp({
    credential: admin.credential.cert("firebase.json")
});

const bancoDados = admin.firestore();

const config = {
    prefix: ">",
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

const perfis = {};
const comandos = new Map();

function registrarComando(nome, argumento) {
    comandos.set(nome, argumento);
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content.match("```")) return;

    const diceRollRegex = new RegExp(`^${config.prefix}(\\d+d\\d+)([+-]\\d+)?$`, 'i');
    const diceRollMatch = message.content.match(diceRollRegex);

    if (diceRollMatch) {
        rolar(message, bancoDados, [diceRollMatch[0].slice(1)]);
        return;
    }

    if (message.content.startsWith(config.prefix)) {
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const comando = comandos.get(commandName);
        if (comando) {
            try {
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

registrarComando("ping", async (message) => {
    message.channel.send("pong")
})

registrarComando("registrar", async (message) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();

    if (verificarPerfil.exists) {
        message.reply('Seu perfil já foi criado!');
    } else {
        criarPerfil(message, bancoDados);
    }
});

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
            .setThumbnail(`${perfil.foto}`)
            .addFields(
                {
                    name: 'Atributos Comuns', value:
                        `❤️ Vida: ${perfil.vida || 0}/${perfil.vidaMax || 0}\n` +
                        `☄️ Mana: ${perfil.mana || 0}/${perfil.manaMax || 0}\n` +
                        `⚡ Energia: ${perfil.energia || 0}/${perfil.energiaMax || 0}`,
                    inline: true,
                },
                {
                    name: 'Dinheiro/Level', value:
                        `💰 Amatinas: ${perfil.amatinas || 0}\n` +
                        `🎇 Astral: ${perfil.astral || 0}\n` +
                        `🕹️ Level: ${perfil.level || 0}`,
                    inline: true
                },
            )

        await message.channel.send({ embeds: [embedPerfil] });
    } else {
        if (verificarUsuario) {
            message.reply(`O perfil de ${verificarUsuario.username} ainda não foi criado.`)
        } else {
            message.reply('Seu perfil ainda não foi criado.')
        }
    }
});

registrarComando("definir", async (message, argumentos) => {

    const usuarioEspecificoID = "401899167196250122";

    if (message.author.id !== usuarioEspecificoID) {
        message.reply('Você não tem permissão para usar este comando.');
        return;
    }

    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;

    const statsArgumentos = verificarUsuario ? argumentos.slice(1) : argumentos;

    if (statsArgumentos.length !== 3 || statsArgumentos.some(isNaN)) {
        return message.reply("Uso incorreto.");
    }

    const [vida, mana, energia] = statsArgumentos.map(Number);

    const verificarPerfil = await bancoDados.collection('perfis').doc(usuarioId).get();
    if (!verificarPerfil.exists) {
        return message.reply("O perfil ainda não foi criado!");
    }
    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId); // Corrigido aqui
    await perfilReferencia.update({
        vida: vida || 0,
        mana: mana || 0,
        energia: energia || 0,
        vidaMax: vida,
        manaMax: mana,
        energiaMax: energia
    });

    await message.delete();
});

registrarComando("cura", async (message, argumentos) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();

    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        curaVida(message, argumentos, bancoDados);
    }
});

registrarComando("dano", async (message, argumentos) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        danoVida(message, argumentos, bancoDados);
    }
});

registrarComando("restaurar", async (message, argumentos) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();

    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        curaMana(message, argumentos, bancoDados);
    }
});

registrarComando("canalizar", async (message, argumentos) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        danoMana(message, argumentos, bancoDados);
    }
});

registrarComando("descansar", async (message, argumentos) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();

    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        curaEnergia(message, argumentos, bancoDados);
    }
});

registrarComando("gastar", async (message, argumentos) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        danoEnergia(message, argumentos, bancoDados);
    }
});

registrarComando("pagar", async (message, argumentos) => {
    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        pagarDinheiro(message, argumentos, bancoDados);
    }
});

registrarComando("dinheiro+", async (message, argumentos) => {
    const usuarioEspecificoID = "401899167196250122";

    if (message.author.id !== usuarioEspecificoID) {
        message.reply('Você não tem permissão para usar este comando.');
        return;
    }

    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        depositarDinheiro(message, argumentos, bancoDados);
    }
});

registrarComando("dinheiro-", async (message, argumentos) => {
    const usuarioEspecificoID = "401899167196250122";

    if (message.author.id !== usuarioEspecificoID) {
        message.reply('Você não tem permissão para usar este comando.');
        return;
    }

    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        tirarDinheiro(message, argumentos, bancoDados);
    }
});

registrarComando("astral+", async (message, argumentos) => {
    const usuarioEspecificoID = "401899167196250122";

    if (message.author.id !== usuarioEspecificoID) {
        message.reply('Você não tem permissão para usar este comando.');
        return;
    }

    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        depositarAstral(message, argumentos, bancoDados);
    }
});

registrarComando("astral-", async (message, argumentos) => {
    const usuarioEspecificoID = "401899167196250122";

    if (message.author.id !== usuarioEspecificoID) {
        message.reply('Você não tem permissão para usar este comando.');
        return;
    }

    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        pagarAstral(message, argumentos, bancoDados);
    }
});

registrarComando("level+", async (message, argumentos) => {
    const usuarioEspecificoID = "401899167196250122";

    if (message.author.id !== usuarioEspecificoID) {
        message.reply('Você não tem permissão para usar este comando.');
        return;
    }

    // Verificar se o argumento é um número e se não é negativo
    if (isNaN(argumentos) || argumentos < 0) {
        message.reply('Por favor, forneça um número válido e positivo.');
        return;
    }

    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        depositarLevel(message, argumentos, bancoDados);
    }
});

registrarComando("level-", async (message, argumentos) => {
    const usuarioEspecificoID = "401899167196250122";

    if (message.author.id !== usuarioEspecificoID) {
        message.reply('Você não tem permissão para usar este comando.');
        return;
    }

    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        message.reply('O Perfil não foi criado!');
    } else {
        pagarLevel(message, argumentos, bancoDados);
    }
});

registrarComando("cor", async (message, argumentos) => {
    if (argumentos.length === 1) {
        const novaCor = argumentos[0].trim();
        if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(novaCor)) {
            return;
        }

        const perfilRef = bancoDados.collection('perfis').doc(message.author.id);
        await perfilRef.update({ cor: novaCor });
        return message.reply(`Cor do perfil alterada com sucesso para ${novaCor}.`);
    }
});

registrarComando("ajuda", async (message) => {
    const helpEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Lista de Comandos')
        .addFields(
            { name: '>ping', value: 'Responde com "pong"', inline: false },
            { name: '>registrar', value: 'Registrar perfil', inline: false },
            { name: '>apagar', value: 'Apagar perfil', inline: false },
            { name: '>perfil [@Usuário]', value: 'Mostra o perfil do mencionado ou o próprio', inline: false },
            { name: '>cor [Código Hex]', value: 'altera a cor do perfil', inline: false },
            { name: '>definir [vida] [mana] [energia]', value: 'Define os atributos de vida, mana e energia do perfil', inline: false },
            { name: '>cura [valor]', value: 'Cura uma quantidade de vida do perfil', inline: false },
            { name: '>dano [valor]', value: 'Causa uma quantidade de dano à vida do perfil', inline: false },
            { name: '>restaurar [valor]', value: 'Restaura uma quantidade de mana do perfil', inline: false },
            { name: '>canalizar [valor]', value: 'Causa uma quantidade de dano à mana do perfil', inline: false },
            { name: '>descansar [valor]', value: 'Restaura uma quantidade de energia do perfil', inline: false },
            { name: '>gastar [valor]', value: 'Causa uma quantidade de dano à energia do perfil', inline: false },
            { name: '>depositar [@Usuário] [valor]', value: 'Deposita uma quantidade de dinheiro do perfil', inline: false },
            { name: '>pagar [valor]', value: 'Usado para utilizar o dinheiro', inline: false },
        );

    await message.channel.send({ embeds: [helpEmbed] });
});