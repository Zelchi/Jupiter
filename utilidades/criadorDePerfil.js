import validUrl from "valid-url";

async function criarPerfil(message, bancoDados) {
    const nomePerfil = await message.reply("Envie o nome do seu personagem.");

    const coletarNome = message.channel.createMessageCollector({
        filter: (msg) => msg.author.id === message.author.id,
        time: 60000,
        max: 1,
    });

    coletarNome.on('collect', async (nomeColetado) => {
        const nome = nomeColetado.content.trim();

        // Não precisa verificar se o nome é uma URL válida, pois é uma string

        await nomeColetado.reply("Envie a URL da foto do seu personagem");

        const coletarFoto = message.channel.createMessageCollector({
            filter: (msg) => msg.author.id === message.author.id,
            time: 60000,
            max: 1,
        });

        coletarFoto.on('collect', async (fotoColetada) => {
            const foto = fotoColetada.content.trim();

            if (!validUrl.isUri(foto)) {
                await fotoColetada.reply("URL ou Foto invalida, inicie o comando novamente.");
                return;
            }

            const perfil = {
                cor: "#ffffff",
                nomePersonagem: nome,
                foto: foto,
                numeroPerfil: 0,
                amatinas: 0,
                astral: 0,
                vida: 0,
                energia: 0,
                mana: 0,
            };

            await bancoDados.collection('perfis').doc(message.author.id).set(perfil);

            await fotoColetada.reply("Perfil criado com sucesso.");
        });
    });
}

export { criarPerfil };