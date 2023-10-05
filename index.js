const { default: makeWASocket, DisconnectReason, makeInMemoryStore, BufferJSON, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const Boom = require('@hapi/boom');
const P = require('pino');
const fs = require('fs');


async function connectToWhatsApp() {
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

    client.ev.on('messages.upsert', m => {
        console.log(JSON.stringify(m, undefined, 2))
        const from = m.messages[0].key.remoteJid;
        console.log('replying to', m.messages[0].key.remoteJid)

    })
}
// run in main file
connectToWhatsApp()