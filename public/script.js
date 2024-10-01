// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
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

            // Carrega votos e votantes do Firestore após a autenticação
            loadVotes();
            loadVoters();
        })
        .catch((error) => {
            console.error("Erro na autenticação anônima: ", error);
        });

    // Variáveis de votos e votantes
    let boyVotes = 0;
    let girlVotes = 0;
    const voters = [];
    let currentVote = '';

    // Referências aos elementos
    const voteBoyButton = document.getElementById('voteBoy');
    const voteGirlButton = document.getElementById('voteGirl');
    const nameInputContainer = document.getElementById('nameInputContainer');
    const nameInput = document.getElementById('nameInput');
    const confirmNameButton = document.getElementById('confirmNameButton');
    const resultsChart = document.getElementById('resultsChart');
    const toggleListButton = document.getElementById('toggleListButton');
    const voterList = document.getElementById('voterList');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Funções de voto
    voteBoyButton.addEventListener('click', () => {
        currentVote = 'Menino'; // Define o voto atual
        showNameInput();
    });

    voteGirlButton.addEventListener('click', () => {
        currentVote = 'Menina'; // Define o voto atual
        showNameInput();
    });

    // Exibe o campo de entrada para o nome
    function showNameInput() {
        nameInputContainer.style.display = 'flex';
        nameInput.placeholder = "seu nome";
        nameInput.focus();
    }

    // Captura o evento de Enter
    nameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            confirmVote();
        }
    });

    // Confirmação de voto ao clicar no ícone
    confirmNameButton.addEventListener('click', confirmVote);

    async function confirmVote() {
        const name = nameInput.value.trim();
        if (name) {
            // Atualiza os votos no Firestore
            const voteRef = doc(db, "votes", "voteResults");
            const voterRef = doc(db, "voters", name); // A referência do votante permanece a mesma

            try {
                const voteDoc = await getDoc(voteRef);
                if (voteDoc.exists()) {
                    const data = voteDoc.data();
                    boyVotes = data.boyVotes;
                    girlVotes = data.girlVotes;

                    if (currentVote === 'Menino') {
                        boyVotes++;
                    } else {
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
                        boyVotes: currentVote === 'Menino' ? 1 : 0,
                        girlVotes: currentVote === 'Menina' ? 1 : 0
                    });
                }

                // Armazena o votante no Firestore
                await setDoc(voterRef, {
                    name: name,
                    vote: currentVote
                });

                nameInput.value = ''; // Limpa o campo de entrada
                nameInputContainer.style.display = 'none'; // Oculta o campo
                // updateChart(); // Atualiza o gráfico
                // displayVoterList(); // Atualiza a lista de votantes
            } catch (error) {
                console.error("Erro ao salvar voto: ", error);
            }
        }
    }

    // Função para obter os votos do Firestore e atualizar o gráfico
    function loadVotes() {
        const voteRef = doc(db, "votes", "voteResults");
        loadingIndicator.style.display = 'block';

        onSnapshot(voteRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                boyVotes = data.boyVotes;
                girlVotes = data.girlVotes;
                updateChart();
                loadingIndicator.style.display = 'none';
            }
        });
    }

    // Função para carregar a lista de votantes do Firestore
    function loadVoters() {
        const voterRef = collection(db, "voters"); // Altere para collection

        onSnapshot(voterRef, (querySnapshot) => {
            voters.length = 0; // Limpa a lista de votantes
            querySnapshot.forEach((doc) => {
                voters.push(doc.data());
            });
            displayVoterList();
        });
    }

    // Configuração do gráfico
    let resultsChartInstance;

    function updateChart() {
        const ctx = resultsChart.getContext('2d');
        if (resultsChartInstance) {
            resultsChartInstance.destroy();
        }
        resultsChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['👦 Menino', '👧 Menina'],
                datasets: [{
                    label: 'Votos',
                    data: [boyVotes, girlVotes],
                    backgroundColor: ['#87CEEB', '#FFB6C1'],
                    borderWidth: 2,
                    borderColor: '#FFF',
                    hoverOffset: 8
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        backgroundColor: '#FFF',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderWidth: 1,
                        borderColor: '#87CEEB'
                    }
                }
            }
        });
    }

    // Função para exibir/ocultar a lista de votantes
    toggleListButton.addEventListener('click', () => {
        voterList.style.display = voterList.style.display === 'none' ? 'block' : 'none';
    });

    // Função para atualizar a lista de votantes
    function displayVoterList() {
        voterList.innerHTML = '';
        voters.forEach(voter => {
            const li = document.createElement('li');
            li.textContent = `${voter.name} votou em ${voter.vote}`;
            voterList.appendChild(li);
        });
        // Exibe o botão de alternância se houver votantes
        if (voters.length > 0) {
            toggleListButton.style.display = 'block'; // Torna o botão visível
        } else {
            toggleListButton.style.display = 'none'; // Esconde o botão se não houver votantes
        }
    }

}).catch(error => {
    console.error("Erro ao inicializar o Firebase: ", error);
});
