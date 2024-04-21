import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, messageLink } from "discord.js";

// Cura - Vida
async function curaVida(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Uso incorreto");
    }

    const curaVida = Number(argumentos[argumentos.length - 1]);

    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;

    if (argumentos.length === 2 && !message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("Você não tem permissão para curar outros usuários.");
    }

    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();

    if (!verificarPerfil.exists) {
        return message.reply("O perfil do usuário mencionado não foi encontrado ou ainda não foi criado.");
    }

    const perfil = verificarPerfil.data();
    const vidaAtual = perfil.vida || 0;

    const novaVida = Math.min(perfil.vidaMax || 100, vidaAtual + curaVida);

    await perfilReferencia.update({ vida: novaVida });

    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('❤️ Cura Recebida')
        .setThumbnail('https://cdn.discordapp.com/attachments/1199656699561246751/1204800801063575612/Heal.gif?ex=65d60d2f&is=65c3982f&hm=d516151da02bb08bc46a74b40eb3141ee1ecdca8089fbeac528bef5676728f21&')
        .setDescription(`${perfil.nomePersonagem} foi curado! Vida restante: ${novaVida}.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })

    await message.channel.send({ embeds: [embed] });
    await message.delete();
}
export { curaVida };

//Dano - Vida
async function danoVida(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Uso incorreto");
    }

    const dano = Number(argumentos[argumentos.length - 1]);

    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;

    if (argumentos.length === 2 && !message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("Você não tem permissão para curar outros usuários.");
    }

    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();

    if (!verificarPerfil.exists) {
        return message.reply("O perfil do usuário mencionado não foi encontrado ou ainda não foi criado.");
    }

    const perfil = verificarPerfil.data();
    const novaVida = Math.max(0, (perfil.vida || 0) - dano);
    const embedTitle = novaVida === 0 ? '💀 Morte' : '💔 Dano Sofrido';
    const embedThumbnail = novaVida === 0 ? 'https://cdn.discordapp.com/attachments/1204870603446820945/1204870653308706857/Morte.gif?ex=65d64e3d&is=65c3d93d&hm=4c23a4b0caa25c3fd604d733eaba60e6dd6604ba2365aac8d01dd9d208a426cc&' : 'https://cdn.discordapp.com/attachments/1199656699561246751/1204800800707313685/Dmg.gif?ex=65d60d2f&is=65c3982f&hm=a939572422802d7f130a480549491b3b35229aedb7f9d333e451c88b2acbc04d&';
    const embedDescription = novaVida === 0 ? `${perfil.nomePersonagem} morreu.` : `${perfil.nomePersonagem} sofreu ${dano} de dano. Vida restante: ${novaVida}.`;

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(embedTitle)
        .setThumbnail(embedThumbnail)
        .setDescription(embedDescription)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() });

    await perfilReferencia.update({ vida: novaVida });

    await message.channel.send({ embeds: [embed] });
    await message.delete();
}
export { danoVida };

// Cura - Mana
async function curaMana(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Uso incorreto");
    }

    const restaurarMana = Number(argumentos[argumentos.length - 1]);

    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;

    if (argumentos.length === 2 && !message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("Você não tem permissão para curar outros usuários.");
    }

    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();

    if (!verificarPerfil.exists) {
        return message.reply("O perfil do usuário mencionado não foi encontrado ou ainda não foi criado.");
    }

    const perfil = verificarPerfil.data();
    const manaAtual = perfil.mana || 0;

    const novaMana = Math.min(perfil.manaMax || 100, manaAtual + restaurarMana);

    await perfilReferencia.update({ mana: novaMana });

    const embed = new EmbedBuilder()
        .setColor('#993399')
        .setTitle('💧 Restauração de Mana')
        .setThumbnail('https://cdn.discordapp.com/attachments/1204870603446820945/1204870652910379072/Restore.gif?ex=65d64e3d&is=65c3d93d&hm=744bc08ec81d2468faf85b6f70a90fd8b8de640172631b6ea175ebca62d3a2ee&')
        .setDescription(`${perfil.nomePersonagem} teve sua mana restaurada! Mana restante: ${novaMana}.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })

    await message.channel.send({ embeds: [embed] });
    await message.delete();
}
export { curaMana };

// Dano - Mana
async function danoMana(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Uso incorreto");
    }

    const custoMana = Number(argumentos[argumentos.length - 1]);

    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;

    if (argumentos.length === 2 && !message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("Você não tem permissão para curar outros usuários.");
    }

    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();

    if (!verificarPerfil.exists) {
        return message.reply("O perfil do usuário mencionado não foi encontrado ou ainda não foi criado.");
    }

    const perfil = verificarPerfil.data();
    const novaMana = Math.max(0, (perfil.mana || 0) - custoMana);

    await perfilReferencia.update({ mana: novaMana });

    const embed = new EmbedBuilder()
        .setColor('#0000FF') // Cor azul para indicar mana
        .setTitle('☄️ Mana Utilizada')
        .setThumbnail('https://cdn.discordapp.com/attachments/1204870603446820945/1204870652511780915/Cast.gif?ex=65d64e3c&is=65c3d93c&hm=403aa70c1e9e08a7415164fdef7f9c6fc33981b03cdea1491fb7edb42cafaf17&')
        .setDescription(`${perfil.nomePersonagem} gastou ${custoMana} de Mana. Mana restante: ${novaMana}.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() }) // Adiciona o nome e a imagem do autor

    await message.channel.send({ embeds: [embed] });
    await message.delete(); // Apaga a mensagem original do usuário
}
export { danoMana };

// Cura - Energia
async function curaEnergia(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Uso incorreto");
    }

    const restaurarEnergia = Number(argumentos[argumentos.length - 1]);

    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;

    if (argumentos.length === 2 && !message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("Você não tem permissão para curar outros usuários.");
    }

    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();

    if (!verificarPerfil.exists) {
        return message.reply("O perfil do usuário mencionado não foi encontrado ou ainda não foi criado.");
    }

    const perfil = verificarPerfil.data();
    const energiaAtual = perfil.energia || 0;
    const novaEnergia = Math.min(perfil.energiaMax || 100, energiaAtual + restaurarEnergia);

    await perfilReferencia.update({ energia: novaEnergia });

    const embed = new EmbedBuilder()
        .setColor('#808080')
        .setTitle('😴 Restauração de Energia')
        .setThumbnail('https://cdn.discordapp.com/attachments/1199656699561246751/1204800802158542888/Rest.gif?ex=65d60d2f&is=65c3982f&hm=bb536fee8a2a0ddf146b5ee61138a8076fbb8f39f7399ddb8687ce5196a52927&')
        .setDescription(`${perfil.nomePersonagem} teve sua energia restaurada! Energia restante: ${novaEnergia}.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })

    await message.channel.send({ embeds: [embed] });
    await message.delete();
}
export { curaEnergia };

// Dano - Energia
async function danoEnergia(message, argumentos, bancoDados) {
    if (argumentos.length < 1 || argumentos.length > 2 || isNaN(argumentos[argumentos.length - 1])) {
        return message.reply("Uso incorreto");
    }

    const custoEnergia = Number(argumentos[argumentos.length - 1]);

    const verificarUsuario = message.mentions.users.first();
    const usuarioId = verificarUsuario ? verificarUsuario.id : message.author.id;

    if (argumentos.length === 2 && !message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("Você não tem permissão para curar outros usuários.");
    }

    const perfilReferencia = bancoDados.collection('perfis').doc(usuarioId);
    const verificarPerfil = await perfilReferencia.get();

    if (!verificarPerfil.exists) {
        return message.reply("O perfil do usuário mencionado não foi encontrado ou ainda não foi criado.");
    }

    const perfil = verificarPerfil.data();
    const novaEnergia = Math.max(0, (perfil.energia || 0) - custoEnergia);

    await perfilReferencia.update({ energia: novaEnergia });

    const embed = new EmbedBuilder()
        .setColor('#FFFF00') // Cor amarela para indicar energia
        .setTitle('⚡ Energia Consumida')
        .setThumbnail('https://cdn.discordapp.com/attachments/1199656699561246751/1204800802699354163/Nrg.gif?ex=65d60d2f&is=65c3982f&hm=50121562061b0828c2871e18b656bd27408d3ac1a3476e181d59019074e43941&')
        .setDescription(`${perfil.nomePersonagem} gastou ${custoEnergia} de Energia. Energia restante: ${novaEnergia}.`)
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() }) // Adiciona o nome e a imagem do autor

    await message.channel.send({ embeds: [embed] });
    await message.delete(); // Apaga a mensagem original do usuário
}
export { danoEnergia };