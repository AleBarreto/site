// Variáveis de votos e votantes
let boyVotes = 1;
let girlVotes = 1;
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
    nameInput.placeholder = "Digite seu nome e pressione 'Enter'";
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

function confirmVote() {
    const name = nameInput.value.trim();
    if (name) {
        // Adiciona o voto correspondente
        if (currentVote === 'Menino') {
            boyVotes++;
        } else {
            girlVotes++;
        }

        voters.push({ name, vote: currentVote }); // Armazena o votante
        nameInput.value = ''; // Limpa o campo de entrada
        nameInputContainer.style.display = 'none'; // Oculta o campo
        updateChart();
        toggleListButton.style.display = voters.length > 0 ? 'block' : 'none'; // Exibe o botão de lista se houver votos
        displayVoterList();
    }
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
            },
            animation: {
                animateScale: true,
                duration: 2000,
                easing: 'easeOutElastic'
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
}

// Inicializa a lista de votantes
displayVoterList();
updateChart();