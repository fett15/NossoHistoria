document.addEventListener('DOMContentLoaded', function() {
    // Configurações iniciais
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const bgMusic = document.getElementById('bgMusic');
    const muteBtn = document.getElementById('mute-btn');
    const giftWrapper = document.getElementById('gift-wrapper');
    const secretMessage = document.getElementById('secretMessage');
    const secretGalleryMessage = document.getElementById('secret-gallery-message');
    const heartsContainer = document.getElementById('hearts-container');

    // Sistema de música
    if (bgMusic) {
        bgMusic.volume = 0.3;

        // Tenta reproduzir a música automaticamente no desktop
        // No mobile, a reprodução automática é geralmente bloqueada, então o botão de mute/play é essencial.
        if (!isMobile) {
            bgMusic.play().catch(e => console.warn("Autoplay de música bloqueado:", e));
        }

        if (muteBtn) {
            muteBtn.style.display = 'flex'; // Garante que o botão seja visível
            muteBtn.addEventListener('click', function() {
                if (bgMusic.paused) {
                    bgMusic.play().catch(e => console.error("Erro ao reproduzir música:", e));
                    this.innerHTML = '<i class="fas fa-volume-up"></i>';
                    this.setAttribute('aria-label', 'Mute Music');
                } else {
                    bgMusic.pause();
                    this.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    this.setAttribute('aria-label', 'Unmute Music');
                }
            });
        }
    }

    // Presente de abertura
    if (giftWrapper) {
        giftWrapper.addEventListener('click', function() {
            this.classList.add('open');
            setTimeout(() => {
                this.style.display = 'none';
                if (bgMusic && bgMusic.paused) { // Tenta tocar a música após a interação
                    bgMusic.play().catch(e => console.warn("Autoplay de música bloqueado após interação:", e));
                }
            }, 1500);
        });
    }

    // Corações flutuantes
    function createHeart() {
        if (!heartsContainer) return; // Verifica se o container existe
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.classList.add('heart');
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = (Math.random() * (isMobile ? 15 : 20) + 10) + 'px';
        heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
        heartsContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 6000);
    }
    setInterval(createHeart, 300);

    // Lightbox (para ambas as galerias)
    const lightbox = document.getElementById('lightbox-overlay');

    if (lightbox) {
        // Seleciona todos os itens da galeria em ambas as páginas
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', function() {
                const mediaType = this.dataset.mediaType; // Pega o tipo de mídia do data-attribute
                const mediaSrc = this.dataset.fullSrc;   // Pega a URL completa do data-attribute
                const caption = this.querySelector('.caption')?.textContent || this.querySelector('img')?.alt || '';

                let mediaElement;
                if (mediaType === 'video') {
                    mediaElement = `<video src="${mediaSrc}" controls autoplay loop></video>`;
                } else { // Assume 'image' se não for 'video'
                    mediaElement = `<img src="${mediaSrc}" alt="${caption}">`;
                }

                lightbox.innerHTML = `
                    <div class="lightbox-content">
                        <span class="close-btn" aria-label="Fechar">&times;</span>
                        ${mediaElement}
                        ${caption ? `<p class="lightbox-caption">${caption}</p>` : ''}
                    </div>
                `;
                lightbox.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Impede o scroll do body
            });
        });

        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target.classList.contains('close-btn')) {
                lightbox.style.display = 'none';
                document.body.style.overflow = ''; // Restaura o scroll do body
                const video = lightbox.querySelector('video');
                if (video) {
                    video.pause();
                    video.currentTime = 0; // Reseta o vídeo
                }
            }
        });
    }

    // Quebra-cabeça
    const puzzleBoard = document.getElementById('puzzle-board');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const solveBtn = document.getElementById('solve-btn');
    let pieces = [];
    let currentOrder = [];
    const PUZZLE_SIZE = 3;
    const TOTAL_PIECES = PUZZLE_SIZE * PUZZLE_SIZE;
    const EMPTY_INDEX = TOTAL_PIECES - 1;
    const PUZZLE_IMAGE_PATH = 'puzzle-image.jpg'; // Caminho da imagem do puzzle

    if (puzzleBoard) {
        function initPuzzle() {
            puzzleBoard.innerHTML = '';
            pieces = [];
            currentOrder = Array.from({ length: TOTAL_PIECES }, (_, i) => i);

            for (let i = 0; i < TOTAL_PIECES; i++) {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.dataset.originalIndex = i;

                const row = Math.floor(i / PUZZLE_SIZE);
                const col = i % PUZZLE_SIZE;

                if (i !== EMPTY_INDEX) {
                    piece.style.backgroundImage = `url('${PUZZLE_IMAGE_PATH}')`;
                    piece.style.backgroundSize = `${PUZZLE_SIZE * 100}% ${PUZZLE_SIZE * 100}%`; // Ajusta o tamanho da imagem de fundo
                    piece.style.backgroundPosition = `${(col * 100 / (PUZZLE_SIZE - 1))}% ${(row * 100 / (PUZZLE_SIZE - 1))}%`; // Ajusta a posição
                } else {
                    piece.classList.add('empty');
                }

                piece.addEventListener('click', () => {
                    const clickedOriginalIndex = parseInt(piece.dataset.originalIndex);
                    movePiece(clickedOriginalIndex);
                });
                pieces.push(piece);
            }
            renderPuzzle();
            shufflePuzzle();
        }

        function renderPuzzle() {
            const fragment = document.createDocumentFragment();
            currentOrder.forEach(originalIndex => {
                fragment.appendChild(pieces[originalIndex]);
            });
            puzzleBoard.innerHTML = '';
            puzzleBoard.appendChild(fragment);
        }

        function getEmptyPieceCurrentIndex() {
            return currentOrder.indexOf(EMPTY_INDEX);
        }

        function movePiece(clickedOriginalIndex) {
            const clickedCurrentIndex = currentOrder.indexOf(clickedOriginalIndex);
            const emptyCurrentIndex = getEmptyPieceCurrentIndex();

            const clickedRow = Math.floor(clickedCurrentIndex / PUZZLE_SIZE);
            const clickedCol = clickedCurrentIndex % PUZZLE_SIZE;
            const emptyRow = Math.floor(emptyCurrentIndex / PUZZLE_SIZE);
            const emptyCol = emptyCurrentIndex % PUZZLE_SIZE;

            const isAdjacent = (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
                               (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow);

            if (isAdjacent) {
                [currentOrder[clickedCurrentIndex], currentOrder[emptyCurrentIndex]] =
                [currentOrder[emptyCurrentIndex], currentOrder[clickedCurrentIndex]];
                renderPuzzle();
                checkSolved();
            }
        }

        function shufflePuzzle() {
            let solvable = false;
            let attempts = 0;
            while (!solvable && attempts < 1000) {
                for (let i = currentOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [currentOrder[i], currentOrder[j]] = [currentOrder[j], currentOrder[i]];
                }
                solvable = isSolvable(currentOrder);
                attempts++;
            }
            renderPuzzle();
            if (solveBtn) solveBtn.style.display = 'block';
        }

        function isSolvable(arr) {
            let inversions = 0;
            const tempArr = arr.filter(val => val !== EMPTY_INDEX);

            for (let i = 0; i < tempArr.length - 1; i++) {
                for (let j = i + 1; j < tempArr.length; j++) {
                    if (tempArr[i] > tempArr[j]) {
                        inversions++;
                    }
                }
            }
            return inversions % 2 === 0;
        }

        function checkSolved() {
            const solved = currentOrder.every((val, idx) => val === idx);
            if (solved) {
                setTimeout(() => alert('Parabéns! Você completou nosso quebra-cabeça! ❤️'), 300);
                if (solveBtn) solveBtn.style.display = 'none';
            }
        }

        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', shufflePuzzle);
        }

        if (solveBtn) {
            solveBtn.addEventListener('click', function() {
                currentOrder = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
                renderPuzzle();
                checkSolved();
            });
        }

        initPuzzle();
    }

    // Contador de tempo
    const startDate = new Date("2023-12-08T00:00:00"); // Data de início do relacionamento

    function updateCounter() {
        const now = new Date();
        const diff = now - startDate;

        const totalSeconds = Math.floor(diff / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        // Cálculo de anos, meses, dias, horas e minutos restantes
        const years = Math.floor(totalDays / 365.25); // Considera anos bissextos
        const remainingDaysAfterYears = totalDays % 365.25;
        const months = Math.floor(remainingDaysAfterYears / 30.44); // Média de dias por mês
        const days = Math.floor(remainingDaysAfterYears % 30.44);
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60; // Minutos restantes após as horas

        document.getElementById('years').textContent = years;
        document.getElementById('months').textContent = months;
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes; // Atualizado para minutos
    }

    updateCounter();
    setInterval(updateCounter, 1000);

    // Sistema de senhas atualizado
const passwordInput = document.querySelector('.password-input');
const passwordBtn = document.querySelector('.password-btn');
const secretMessages = document.getElementById('secretMessage');
const secretGallery = document.getElementById('secret-gallery');

passwordBtn.addEventListener('click', function() {
    const password = passwordInput.value.toLowerCase().trim();
    
    // Mensagens secretas
    const secretMessages = {
    "autoestima": {
        message: "Você é a pessoa mais incrível que já conheci! Sua autoestima ilumina meu mundo.",
        unlockGallery: true
    },
    "amor": {
        message: "Você descobriu o segredo! Eu te amo mais que tudo! ❤️",
        unlockGallery: false
    },
    "beijo": {
        message: "Lembro do nosso primeiro beijo como se fosse hoje. Foi mágico!",
        unlockGallery: false
    },
    "mudança": {
        message: "Obrigado por estar comigo naquela fase difícil. Você me deu forças quando eu mais precisei. 🤗",
        unlockGallery: false
    },
    "1234": {
        message: "Essa era fácil! Mas o que importa é que você sabe que eu te amo muito, mesmo quando não digo. 💕",
        unlockGallery: false
    },
    "undertale": {
        message: "You’re filled with Determination… and eu sou preenchido com amor por você.",
        unlockGallery: false
    },
    "aquelescaras": {
        message: "Entre piadas internas e vídeos bobos, 'Aqueles Caras' viraram parte da nossa história. E rir com você… é uma das minhas partes favoritas.",
        unlockGallery: false
    },
    "hotdog": {
        message: "Você me conquistou com carinho… e cachorro-quente. Eu nunca mais fui o mesmo depois daquela noite.",
        unlockGallery: false
    },
    "jardim": {
        message: "Já dizia o Jotapê:\n'Cê não acreditaria no amor se conhecesse os bastidores…\nEu vim do Balde de Lixo e vou para o Jardim das Flores.'\n\nE é isso que viver com você me ensinou — que mesmo quem vem do caos pode florescer. Você me mostrou que amor não precisa ser perfeito, só precisa ser verdadeiro. Hoje, por você, eu sou mais forte. E mais flor também. 🌷",
        unlockGallery: false
    },
    "abraco": {
        message: "Seu abraço é minha casa. E mesmo quando não estou nele, é pra lá que meu coração corre.",
        unlockGallery: false
    },
    "milagre": {
        message: "Você foi o milagre que chegou quando eu achava que tudo ia desmoronar.",
        unlockGallery: false
    },
    "futuro": {
        message: "Eu ainda não sei como vai ser o amanhã, mas tenho certeza de uma coisa: eu quero viver cada pedacinho com você.",
        unlockGallery: false
    },
    "promessa": {
        message: "Prometo nunca esquecer de te lembrar o quanto você é amada.",
        unlockGallery: false
    },
    "sónosso": {
        message: "Tem coisas que são só nossas… e nem o mundo inteiro entenderia.",
        unlockGallery: false
    },
    "cores": {
        message: "Você trouxe cor pra minha vida onde só havia cinza.",
        unlockGallery: false
    }
};
    // Verifica se a senha digitada corresponde a alguma mensagem secreta

    if (secretMessages[password]) {
        secretMessage.innerHTML = `<p>${secretMessages[password].message}</p>`;
        secretMessage.style.display = 'block';
        
        // Se for a senha correta, mostra a galeria secreta
        if (password === "autoestima" && secretGallery) {
            secretGallery.style.display = 'block';
            setTimeout(() => {
                secretGallery.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    } else {
        secretMessage.innerHTML = '<p>Senha incorreta! Tente lembrar de algo especial entre nós...</p>';
        secretMessage.style.display = 'block';
    }
    
    passwordInput.value = '';
});

// Também funciona com Enter
passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        passwordBtn.click();
    }
});

    // Animação ao rolar
    const sections = document.querySelectorAll('section');

    function checkScroll() {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            // Ativa a seção quando 80% dela está visível na viewport
            if (sectionTop < window.innerHeight - (section.clientHeight * 0.2)) {
                section.classList.add('active');
            } else {
                // Opcional: remove a classe 'active' se a seção sair da tela
                // section.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Chama ao carregar para ativar seções visíveis

    // Cursor personalizado
    const customCursor = document.querySelector('.custom-cursor');
    if (customCursor) {
        document.addEventListener('mousemove', (e) => {
            customCursor.style.left = e.clientX + 'px';
            customCursor.style.top = e.clientY + 'px';
        });
    }
});
