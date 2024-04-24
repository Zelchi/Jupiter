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

    if (valor <= 0) {
        return;
    }

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

// Tirar - Dinheiro
async function tirarDinheiro(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Erro");
    }

    const valor = Math.floor(Number(argumentos[argumentos.length - 1]));
    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;
    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();
    const perfil = verificarPerfil.data();

    if (valor <= 0) {
        return message.reply;
    }

    if (!verificarPerfil.exists) {
        return message.reply("Perfil não registrado.");
    }

    if (valor > perfil.amatinas) {
        await message.delete();
        return
    }

    const novoValor = perfil.amatinas - valor

    await perfilReferencia.update({ amatinas: novoValor });

    const embed = new EmbedBuilder()
        .setColor('#006400')
        .setTitle('💰 Pagamento!')
        .setThumbnail('https://cdn.discordapp.com/attachments/1204870603446820945/1204870653677801472/Coin.gif?ex=66295cbd&is=66280b3d&hm=72bf5c9dea20153717964a1f9f16e81d4a1cce4370e01457184905e96eaff911&')
        .setDescription(`${perfil.nomePersonagem} pagou com ${valor} Amatinas do seu bolso.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })

    await message.channel.send({ embeds: [embed] });
    await message.delete();
};
export { tirarDinheiro };

// Pagar - Dinheiro
async function pagarDinheiro(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Erro");
    }

    const valor = Math.floor(Number(argumentos[argumentos.length - 1]));

    let destinatarioId;
    if (argumentos.length === 2) {
        const verificarUsuario = message.mentions.users.first();
        if (!verificarUsuario) {
            return message.reply("Por favor, mencione um usuário válido para transferir as amatinas.");
        }
        destinatarioId = verificarUsuario.id;
    } else {
        destinatarioId = message.author.id;
    }

    const perfilReferenciaRemetente = bancoDados.collection('perfis').doc(message.author.id);
    const verificarPerfilRemetente = await perfilReferenciaRemetente.get();
    const perfilRemetente = verificarPerfilRemetente.data();

    if (!verificarPerfilRemetente.exists) {
        return message.reply("Perfil não registrado.");
    }

    if (valor <= 0) {
        return message.reply("Por favor, insira um valor válido maior que zero.");
    }

    if (valor > perfilRemetente.amatinas) {
        return message.reply("Você não tem amatinas suficientes para realizar essa transação.");
    }

    const novoValorRemetente = perfilRemetente.amatinas - valor;

    await perfilReferenciaRemetente.update({ amatinas: novoValorRemetente });

    if (destinatarioId !== message.author.id) {
        const perfilReferenciaDestinatario = bancoDados.collection('perfis').doc(destinatarioId);
        const verificarPerfilDestinatario = await perfilReferenciaDestinatario.get();
        const perfilDestinatario = verificarPerfilDestinatario.data();

        if (!verificarPerfilDestinatario.exists) {
            return message.reply("O perfil do destinatário não está registrado.");
        }

        const novoValorDestinatario = perfilDestinatario.amatinas + valor;
        await perfilReferenciaDestinatario.update({ amatinas: novoValorDestinatario });

        const embedRemetente = new EmbedBuilder()
            .setColor('#006400')
            .setTitle('💰 Transferência!')
            .setThumbnail('https://cdn.discordapp.com/attachments/1204870603446820945/1204870653677801472/Coin.gif?ex=66295cbd&is=66280b3d&hm=72bf5c9dea20153717964a1f9f16e81d4a1cce4370e01457184905e96eaff911&')
            .setDescription(`${perfilRemetente.nomePersonagem} transferiu ${valor} Amatinas para ${perfilDestinatario.nomePersonagem}.`)
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() });

        await message.channel.send({ embeds: [embedRemetente] });
        await message.delete();
    } else {
        const embed = new EmbedBuilder()
            .setColor('#006400')
            .setTitle('💰 Pagamento!')
            .setThumbnail('https://cdn.discordapp.com/attachments/1204870603446820945/1204870653677801472/Coin.gif?ex=66295cbd&is=66280b3d&hm=72bf5c9dea20153717964a1f9f16e81d4a1cce4370e01457184905e96eaff911&')
            .setDescription(`${perfilRemetente.nomePersonagem} pagou com ${valor} Amatinas do seu bolso.`)
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() });

        await message.channel.send({ embeds: [embed] });
        await message.delete();
    }
}
export { pagarDinheiro };