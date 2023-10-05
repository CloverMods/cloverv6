const bot = require('./index.js');
const fs = require("fs");
const info = JSON.parse(fs.readFileSync('./info.json'));
const { prfixo, bot_name } = info.prefixo;


// Conectar ao WhatsApp
bot.connectToWhatsApp();

// Manipular mensagens recebidas e executar comandos
bot.onMessageReceived = async (message) => {
    const { body, from } = message;

    // Verifique se a mensagem começa com um caractere de comando (por exemplo, "!")
    if (body.startsWith(prefixo)) {
        const command = body.slice(1).trim(); // Remova o caractere "!" e remova espaços em branco

        // Verifique o comando e execute a ação apropriada
        if (command === 'comando1') {
            // Executar ação para o comando1
            await bot.sendMessage(from, {text: 'Executando comando 1'});
        } else if (command === 'comando2') {
            // Executar ação para o comando2
            await bot.sendMessage(from, {text: 'Executando comando 2'});
        } else {
            // Comando desconhecido, envie uma mensagem de ajuda
            await bot.sendMessage(from, {text: 'Esse comando nao existe meu nobre'});
        }
    }
};
