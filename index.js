const { default: makeWASocket, DisconnectReason, makeInMemoryStore, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
let client; 

async function connectToWhatsApp() {
    try {
        const store = makeInMemoryStore({
            logger: P().child({
                level: 'debug',
                stream: 'store'
            })
        })

        // NOME DO ARQUIVO DO CÓDIGO QR
        const { state, saveCreds } = await useMultiFileAuthState('./arquivo-qr')
        const sock = makeWASocket({
            logger: P({ level: 'silent' }),
            printQRInTerminal: true,
            auth: state
        });
        client = sock;
        store.bind(client.ev)

        client.ev.on("creds.update", saveCreds)
        store.bind(client.ev)
        client.ev.on("chats.set", () => {
            console.log("Tem conversas", store.chats.all())
        })
        client.ev.on("contacts.set", () => {
            console.log("Tem contatos", Object.values(store.contacts))
        })
        // CONEXÃO ATUALIZAÇÃO 
        client.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect } = update
            if (connection === "close") {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
                console.log("Conexão fechada devido a", lastDisconnect.error, "Tentando reconectar...", shouldReconnect);
                if (shouldReconnect) {
                    connectToWhatsApp()
                }

            } else if (connection === "open") {
                console.log("Conectado com sucesso!");
            }
        })

        // Manipular mensagens recebidas
        client.ev.on('messages.upsert', async (message) => {
            console.log(JSON.stringify(message, undefined, 2));

            // Verifique se a mensagem é uma mensagem de texto
            if (message.messages && message.messages[0].message && message.messages[0].message.conversation) {
                await handleCommand(message.messages[0].message); // Chame a função para manipular comandos
            }
        });
    } catch (error) {
        console.error("Erro ao conectar ao WhatsApp:", error);
    }
}

// Função para enviar uma mensagem de texto
async function sendMessage(jid, text) {
    try {
        if (!client) {
            console.error("O cliente não está conectado.");
            return;
        }

        await client.sendMessage(jid, {text: text});
    } catch (error) {
        console.error("Erro ao enviar mensagem de texto:", error);
    }
}


// Exporte a função connectToWhatsApp
module.exports = {
    connectToWhatsApp
};
