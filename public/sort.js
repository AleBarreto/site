// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

// Função para obter configurações do Firebase
async function getFirebaseConfig() {
    const response = await fetch('https://sitenode-serve-server-js.onrender.com/firebase-config');
    if (!response.ok) {
        throw new Error('Erro ao obter configurações do Firebase');
    }
    return response.json();
}


// Inicialize o Firebase com as configurações obtidas
getFirebaseConfig().then(firebaseConfig => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth();

    // Autenticação anônima
    signInAnonymously(auth)
        .then(() => {
            console.log("Usuário autenticado anonimamente.");
            loadVoters();
        })
        .catch((error) => {
            console.error("Erro na autenticação anônima: ", error);
        });

        const boyVoterList = document.getElementById('boyVoterList');
        const girlVoterList = document.getElementById('girlVoterList');
        const boyDrawButton = document.getElementById('boyDrawButton');
        const girlDrawButton = document.getElementById('girlDrawButton');
        const boyWinner = document.getElementById('boyWinner');
        const girlWinner = document.getElementById('girlWinner');
    
        let boyVoters = [];
        let girlVoters = [];
    
        // Carregar os votantes do Firestore
        async function loadVoters() {
            const voterCollection = collection(db, "voters");
    
            // Votantes em Menino
            const boyQuery = query(voterCollection, where("vote", "==", "Menino"));
            const boySnapshot = await getDocs(boyQuery);
            boySnapshot.forEach(doc => {
                const voter = doc.data();
                boyVoters.push(voter.name);
                const li = document.createElement('li');
                li.textContent = voter.name;
                boyVoterList.appendChild(li);
            });
    
            // Votantes em Menina
            const girlQuery = query(voterCollection, where("vote", "==", "Menina"));
            const girlSnapshot = await getDocs(girlQuery);
            girlSnapshot.forEach(doc => {
                const voter = doc.data();
                girlVoters.push(voter.name);
                const li = document.createElement('li');
                li.textContent = voter.name;
                girlVoterList.appendChild(li);
            });
        }
    
        document.getElementById("boyDrawButton").addEventListener("click", function() {
            drawWinner(boyVoters, "boyWinner");
        });
        
        document.getElementById("girlDrawButton").addEventListener("click", function() {
            drawWinner(girlVoters, "girlWinner");
        });
        
        function drawWinner(voters, winnerId) {
            if (voters.length === 0) {
                alert("Não há votantes!");
                return;
            }
        
            // Escolhe um vencedor aleatório
            const winner = voters[Math.floor(Math.random() * voters.length)];
        
            // Exibe o vencedor
            const winnerDisplay = document.getElementById(winnerId);
            winnerDisplay.textContent = `Vencedor: ${winner}`;
        
            // Animação nos votantes
            const voterListItems = document.querySelectorAll(`#${winnerId === "boyWinner" ? "boyVoterList" : "girlVoterList"} li`);
        
            // Remove a classe de destaque de todos os itens
            voterListItems.forEach(item => item.classList.remove("highlight"));
        
            // Adiciona a classe de destaque ao vencedor
            const winningItem = Array.from(voterListItems).find(item => item.textContent === winner);
            if (winningItem) {
                winningItem.classList.add("highlight");
            }
        }


}).catch(error => {
    console.error("Erro ao inicializar o Firebase: ", error);
});


