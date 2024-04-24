import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, messageLink } from "discord.js";

// Depositar - Dinheiro
async function depositarDinheiro(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("...");
    }

    const valor = Number(argumentos[argumentos.length - 1]);
    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;
    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();
    const perfil = verificarPerfil.data();

    if (!verificarPerfil.exists) {
        return message.reply("Perfil não registrado.");
    }

    const novoValor = Math.min(perfil.amatinas + valor);

    await perfilReferencia.update({ amatinas: novoValor });

    const embed = new EmbedBuilder()
        .setColor('#90ee90')
        .setTitle('💰 Amatinas recebidas!')
        .setThumbnail('https://cdn.discordapp.com/attachments/1204870603446820945/1204870653677801472/Coin.gif?ex=66295cbd&is=66280b3d&hm=72bf5c9dea20153717964a1f9f16e81d4a1cce4370e01457184905e96eaff911&')
        .setDescription(`${perfil.nomePersonagem} recebeu ${valor} Amatinas. Atual: ${novoValor}.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })

    await message.channel.send({ embeds: [embed] });
    await message.delete();
};
export { depositarDinheiro };

// Pagar - Dinheiro
async function pagarDinheiro(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Erro");
    }

    const valor = Math.floor(Number(argumentos[argumentos.length - 1]));
    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;
    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();
    const perfil = verificarPerfil.data();

    if (!verificarPerfil.exists) {
        return message.reply("Perfil não registrado.");
    }

    if ( valor > perfil.amatinas ) {
        await message.delete();
        return
    }

    const novoValor = perfil.amatinas - valor

    await perfilReferencia.update({ amatinas: novoValor });

    const embed = new EmbedBuilder()
        .setColor('#006400')
        .setTitle('💰 Amatinas retiradas!')
        .setThumbnail('https://cdn.discordapp.com/attachments/1204870603446820945/1204870653677801472/Coin.gif?ex=66295cbd&is=66280b3d&hm=72bf5c9dea20153717964a1f9f16e81d4a1cce4370e01457184905e96eaff911&')
        .setDescription(`${perfil.nomePersonagem} retirou ${valor} Amatinas do seu bolso. Atual: ${novoValor}.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })

    await message.channel.send({ embeds: [embed] });
    await message.delete();
};
export { pagarDinheiro };

//dasdasdasdasdsadasdasda