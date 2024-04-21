import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, messageLink } from "discord.js";

// dado.js
function rolarDados(numDados, numLados) {
    const resultados = [];
    for (let i = 0; i < numDados; i++) {
        resultados.push(aleatoriedade(numLados));
    }
    return resultados;
}

// aleatoriedade.js
function aleatoriedade(maxValue) {
    return Math.ceil(Math.random() * maxValue);
}

async function rolar(message, bancoDados, args) {

    const verificarPerfil = await bancoDados.collection('perfis').doc(message.author.id).get();
    if (!verificarPerfil.exists) {
        return message.channel.send("Crie um perfil para rolar dados.");
    }

    const partes = args[0].match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!partes) {
        return message.reply("Formato de rolagem inválido. Use algo como `!1d20+3` ou `!1d20-4`.");
    }

    const numDados = parseInt(partes[1], 10);
    const numLados = parseInt(partes[2], 10);
    const modificador = partes[3] ? parseInt(partes[3], 10) : 0;

    const perfil = verificarPerfil.data();
    if (!isNaN(numDados) && !isNaN(numLados)) {
        const resultados = rolarDados(numDados, numLados);
        const somaResultados = resultados.reduce((acc, val) => acc + val, 0);
        const resultadoFinal = somaResultados + modificador;

        // Constrói a descrição do embed
        let descricaoEmbed = `${resultados.join(" + ")}`;
        // Inclui o modificador na descrição, se houver
        if (modificador !== 0) {
            const modificadorStr = `${modificador >= 0 ? '+' : ''}${modificador}`;
            descricaoEmbed += ` [${modificadorStr}]`;
        }
        // Inclui o total se houver mais de um dado ou se houver um modificador
        if (numDados > 1 || modificador !== 0) {
            descricaoEmbed += ` = [${resultadoFinal}]`;
        }

        const embed = new EmbedBuilder()
            .setColor("#C3AC84")
            .setTitle(`${perfil.nomePersonagem} jogou ${args[0]}`)
            .setThumbnail("https://cdn.discordapp.com/attachments/1199656699561246751/1201677773580542002/DiceGIF.gif")
            .setDescription(descricaoEmbed);

        await message.channel.send({ embeds: [embed] });
        await message.delete(); // Apaga a mensagem original do usuário
    }
}

export { rolar }