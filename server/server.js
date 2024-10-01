// server.js

const express = require('express');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, updateDoc } = require('firebase/firestore');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // Carrega variáveis do .env

const app = express();
const PORT = 3000;

app.use(cors());

// Middleware para interpretar JSON
app.use(express.json()); // Para lidar com requisições JSON

// Servindo arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Configurações do Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBEASE_MEASUREMENT_ID
};

// Inicializando o Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Rota para obter configurações do Firebase
app.get('/firebase-config', (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/sort', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/sort.html'));
});

// Rota para obter votos
app.get('/votes', async (req, res) => {
    const voteRef = doc(db, "votes", "voteResults");
    const voteDoc = await getDoc(voteRef);
    
    if (voteDoc.exists()) {
        res.status(200).json(voteDoc.data());
    } else {
        res.status(404).send('Votos não encontrados');
    }
});

// Rota para adicionar votos
app.post('/votes', async (req, res) => {
    const { name, vote } = req.body; // Expects { name: 'voterName', vote: 'Menino' or 'Menina' }
    
    const voteRef = doc(db, "votes", "voteResults");
    
    try {
        const voteDoc = await getDoc(voteRef);
        let boyVotes = 0;
        let girlVotes = 0;

        if (voteDoc.exists()) {
            const data = voteDoc.data();
            boyVotes = data.boyVotes;
            girlVotes = data.girlVotes;

            // Atualiza os votos com base na votação
            if (vote === 'Menino') {
                boyVotes++;
            } else if (vote === 'Menina') {
                girlVotes++;
            }
            
            // Atualiza o número de votos no Firestore
            await updateDoc(voteRef, {
                boyVotes: boyVotes,
                girlVotes: girlVotes
            });
        } else {
            // Se o documento ainda não existir, cria um novo
            await setDoc(voteRef, {
                boyVotes: vote === 'Menino' ? 1 : 0,
                girlVotes: vote === 'Menina' ? 1 : 0
            });
        }

        res.status(200).send('Voto registrado com sucesso');
    } catch (error) {
        console.error("Erro ao registrar voto: ", error);
        res.status(500).send('Erro ao registrar voto');
    }
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
