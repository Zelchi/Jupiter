import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, messageLink } from "discord.js";

// Depositar - Level
async function depositarLevel(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("...");
    }

    const valor = Number(argumentos[argumentos.length - 1]);

    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;


    if (argumentos.length === 2 && !message.member.permissions.has("ADMINISTRATOR")) {
        await message.delete();
        return
    }

    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();
    const perfil = verificarPerfil.data();

    if (!verificarPerfil.exists) {
        return message.reply("Perfil não registrado.");
    }

    const novoValor = Math.min(perfil.level + valor);

    await perfilReferencia.update({ level: novoValor });

    const embed = new EmbedBuilder()
        .setColor('#ffa500')
        .setTitle('🕹️ Level UP!')
        .setThumbnail('https://cdn.discordapp.com/attachments/1204870603446820945/1232710139979628629/Level_Up.gif?ex=662a7248&is=662920c8&hm=9ee35f1c033fdeabc4f8a59984c3fa15115a7f3872eab3d116f2751b5f5b5bcc&')
        .setDescription(`${perfil.nomePersonagem} recebeu ${valor}. Atual: ${novoValor}.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })

    await message.channel.send({ embeds: [embed] });
    await message.delete();
};
export { depositarLevel };

// Pagar - Level
async function pagarLevel(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Erro");
    }

    const valor = Math.floor(Number(argumentos[argumentos.length - 1]));

    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;
    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();
    const perfil = verificarPerfil.data();

    if (argumentos.length === 2 && !message.member.permissions.has("ADMINISTRATOR")) {
        await message.delete();
        return
    }

    if (!verificarPerfil.exists) {
        return message.reply("Perfil não registrado.");
    }

    if ( valor > perfil.level ) {
        await message.delete();
        return
    }

    const novoValor = perfil.level - valor

    await perfilReferencia.update({ level: novoValor });

    const embed = new EmbedBuilder()
        .setColor('#008b8b')
        .setTitle('💣 Level perdido?')
        .setThumbnail('https://cdn.discordapp.com/attachments/1204870603446820945/1204870653308706857/Morte.gif?ex=662a057d&is=6628b3fd&hm=90320922abeeae72f071594c621ce55d1a1d8c403bff02422ca028e2115a6a2e&')
        .setDescription(`${perfil.nomePersonagem} perdeu ${valor}. Atual: ${novoValor}.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })

    await message.channel.send({ embeds: [embed] });
    await message.delete();
};
export { pagarLevel };