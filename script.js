// ==================== DONNÉES ====================
// Tableau des chansons avec URL de prévisualisation
const tracks = [
    {
        id: 1,
        title: "Lofi Study Session",
        artist: "ChilledCow",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
        preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: 272 // en secondes
    },
    {
        id: 2,
        title: "Midnight Reflections",
        artist: "Lofi Girl",
        cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
        preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: 305
    },
    {
        id: 3,
        title: "Rainy Day Dreams",
        artist: "Chillhop Music",
        cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
        preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: 240
    },
    {
        id: 4,
        title: "Coffee & Jazz",
        artist: "Jazzhop",
        cover: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&h=300&fit=crop",
        preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: 288
    },
    {
        id: 5,
        title: "Evening Walk",
        artist: "Dreamy Lofi",
        cover: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=300&fit=crop",
        preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        duration: 315
    },
    {
        id: 6,
        title: "Silent Night",
        artist: "Ambient Lofi",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
        preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        duration: 260
    }
];

// ==================== ÉTAT DE L'APPLICATION ====================
let currentTrackIndex = 0;
let isPlaying = false;
let audioPlayer = null;
let repeatMode = 'none'; // 'none', 'one', 'all'
let isShuffle = false;
let shuffledIndices = [];
let currentShuffleIndex = 0;

// ==================== ÉLÉMENTS DU DOM ====================
// Éléments principaux
const currentCover = document.getElementById('current-album-cover');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const audioElement = document.getElementById('audio-player');

// Contrôles
const playBtn = document.getElementById('btn-play');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const nextBtn = document.getElementById('btn-next');
const prevBtn = document.getElementById('btn-prev');
const shuffleBtn = document.getElementById('btn-shuffle');
const repeatBtn = document.getElementById('btn-repeat');
const likeBtn = document.getElementById('btn-like');

// Barre de progression
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');

// Liste des titres
const topTracksContainer = document.getElementById('top-tracks-scroll');

// ==================== FONCTIONS D'INITIALISATION ====================
/**
 * Initialise le lecteur audio
 */
function initAudioPlayer() {
    audioPlayer = audioElement;
    
    if (!audioPlayer) {
        console.error("Élément audio non trouvé");
        return;
    }
    
    // Charger la première piste
    loadTrack(currentTrackIndex);
    
    // Attacher les événements audio
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleTrackEnd);
    audioPlayer.addEventListener('loadedmetadata', handleMetadataLoaded);
    audioPlayer.addEventListener('error', handleAudioError);
}

/**
 * Charge une piste spécifique
 * @param {number} index - Index de la piste à charger
 */
function loadTrack(index) {
    if (!tracks[index]) {
        console.error("Piste introuvable:", index);
        return;
    }
    
    const track = tracks[index];
    
    // Mettre à jour l'affichage
    currentCover.src = track.cover;
    currentCover.alt = track.title;
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    
    // Charger l'audio
    audioPlayer.src = track.preview;
    audioPlayer.load();
    
    // Mettre à jour la durée totale
    updateTotalTime(track.duration);
    
    // Mettre à jour la classe active dans la liste
    highlightActiveTrack(index);
}

/**
 * Met à jour la durée totale affichée
 * @param {number} duration - Durée en secondes
 */
function updateTotalTime(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    timeTotal.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Gère le chargement des métadonnées audio
 */
function handleMetadataLoaded() {
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        updateTotalTime(Math.floor(audioPlayer.duration));
    }
}

/**
 * Gère les erreurs audio
 */
function handleAudioError() {
    console.error("Erreur de lecture audio");
    // Afficher un message à l'utilisateur
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = 'Impossible de lire cet audio';
    errorMsg.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
    `;
    document.body.appendChild(errorMsg);
    setTimeout(() => errorMsg.remove(), 3000);
}

// ==================== FONCTIONS DE LECTURE ====================
/**
 * Joue la piste courante
 */
function playTrack() {
    if (!audioPlayer) return;
    
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            updatePlayPauseIcons();
        })
        .catch(error => {
            console.error("Erreur de lecture:", error);
            isPlaying = false;
            updatePlayPauseIcons();
        });
}

/**
 * Met en pause la piste courante
 */
function pauseTrack() {
    if (!audioPlayer) return;
    
    audioPlayer.pause();
    isPlaying = false;
    updatePlayPauseIcons();
}

/**
 * Alterne entre lecture et pause
 */
function togglePlay() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

/**
 * Met à jour les icônes de lecture/pause
 */
function updatePlayPauseIcons() {
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        playBtn.setAttribute('aria-label', 'Pause');
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        playBtn.setAttribute('aria-label', 'Play');
    }
}

/**
 * Passe à la piste suivante
 */
function nextTrack() {
    if (tracks.length === 0) return;
    
    if (repeatMode === 'one') {
        // Rejouer la même piste
        audioPlayer.currentTime = 0;
        if (isPlaying) playTrack();
        return;
    }
    
    let nextIndex;
    
    if (isShuffle) {
        // Mode aléatoire
        currentShuffleIndex = (currentShuffleIndex + 1) % shuffledIndices.length;
        nextIndex = shuffledIndices[currentShuffleIndex];
    } else {
        // Mode normal
        nextIndex = (currentTrackIndex + 1) % tracks.length;
    }
    
    currentTrackIndex = nextIndex;
    loadTrack(currentTrackIndex);
    
    if (isPlaying) {
        playTrack();
    }
}

/**
 * Revient à la piste précédente
 */
function prevTrack() {
    if (tracks.length === 0) return;
    
    let prevIndex;
    
    if (isShuffle) {
        currentShuffleIndex = (currentShuffleIndex - 1 + shuffledIndices.length) % shuffledIndices.length;
        prevIndex = shuffledIndices[currentShuffleIndex];
    } else {
        prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    }
    
    currentTrackIndex = prevIndex;
    loadTrack(currentTrackIndex);
    
    if (isPlaying) {
        playTrack();
    }
}

// ==================== GESTION DE LA PROGRESSION ====================
/**
 * Met à jour la barre de progression
 */
function updateProgress() {
    if (!audioPlayer || !audioPlayer.duration) return;
    
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Mettre à jour le temps écoulé
    const minutes = Math.floor(audioPlayer.currentTime / 60);
    const seconds = Math.floor(audioPlayer.currentTime % 60);
    timeCurrent.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Permet de chercher dans la piste
 * @param {Event} e - Événement click
 */
function seekTrack(e) {
    if (!audioPlayer || !audioPlayer.duration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * audioPlayer.duration;
    
    audioPlayer.currentTime = newTime;
    updateProgress();
}

// ==================== GESTION DE LA FIN DE PISTE ====================
/**
 * Gère ce qui se passe quand une piste se termine
 */
function handleTrackEnd() {
    if (repeatMode === 'one') {
        // Répéter la même piste
        audioPlayer.currentTime = 0;
        playTrack();
    } else if (repeatMode === 'all' || isShuffle) {
        // Passer à la suivante
        nextTrack();
    } else {
        // Mode normal : s'arrêter à la fin
        if (currentTrackIndex === tracks.length - 1) {
            pauseTrack();
            audioPlayer.currentTime = 0;
            updateProgress();
        } else {
            nextTrack();
        }
    }
}

// ==================== MODES SPÉCIAUX ====================
/**
 * Active/désactive le mode aléatoire
 */
function toggleShuffle() {
    isShuffle = !isShuffle;
    
    if (isShuffle) {
        // Créer une liste aléatoire des indices
        shuffledIndices = Array.from({ length: tracks.length }, (_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }
        
        // Trouver l'index actuel dans la liste mélangée
        currentShuffleIndex = shuffledIndices.indexOf(currentTrackIndex);
        
        shuffleBtn.style.color = 'var(--primary)';
    } else {
        shuffleBtn.style.color = 'var(--text-secondary)';
    }
}

/**
 * Change le mode de répétition
 */
function toggleRepeat() {
    switch(repeatMode) {
        case 'none':
            repeatMode = 'all';
            repeatBtn.style.color = 'var(--primary)';
            repeatBtn.innerHTML = getRepeatIcon('all');
            break;
        case 'all':
            repeatMode = 'one';
            repeatBtn.style.color = 'var(--primary-hover)';
            repeatBtn.innerHTML = getRepeatIcon('one');
            break;
        case 'one':
            repeatMode = 'none';
            repeatBtn.style.color = 'var(--text-secondary)';
            repeatBtn.innerHTML = getRepeatIcon('none');
            break;
    }
}

/**
 * Retourne l'icône SVG appropriée pour le mode répétition
 * @param {string} mode - Mode de répétition
 * @returns {string} HTML de l'icône
 */
function getRepeatIcon(mode) {
    const baseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
    
    if (mode === 'one') {
        return baseIcon + `
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            <line x1="13" y1="12" x2="13" y2="16"></line>
        </svg>`;
    } else {
        return baseIcon + `
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
        </svg>`;
    }
}

// ==================== GESTION DE LA LISTE ====================
/**
 * Affiche toutes les pistes dans la liste horizontale
 */
function renderTrackList() {
    topTracksContainer.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const card = createTrackCard(track, index);
        topTracksContainer.appendChild(card);
    });
    
    // Mettre en surbrillance la piste active
    highlightActiveTrack(currentTrackIndex);
}

/**
 * Crée une carte pour une piste
 * @param {Object} track - La piste
 * @param {number} index - L'index de la piste
 * @returns {HTMLElement} La carte créée
 */
function createTrackCard(track, index) {
    const card = document.createElement('div');
    card.className = 'flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer track-card';
    card.dataset.index = index;
    
    card.innerHTML = `
        <img src="${track.cover}" alt="${track.title}" class="album-cover-thumb" loading="lazy">
        <span class="text-xs font-semibold text-foreground text-center w-[140px] truncate">${track.title}</span>
        <span class="text-xs text-text-secondary text-center w-[140px] truncate">${track.artist}</span>
    `;
    
    card.addEventListener('click', () => selectTrack(index));
    
    return card;
}

/**
 * Sélectionne une piste spécifique
 * @param {number} index - Index de la piste à sélectionner
 */
function selectTrack(index) {
    if (index === currentTrackIndex) {
        // Si c'est la même piste, toggle play/pause
        togglePlay();
    } else {
        // Sinon, charger la nouvelle piste
        currentTrackIndex = index;
        loadTrack(currentTrackIndex);
        
        if (isPlaying) {
            playTrack();
        }
    }
    
    highlightActiveTrack(index);
}

/**
 * Met en surbrillance la piste active dans la liste
 * @param {number} activeIndex - Index de la piste active
 */
function highlightActiveTrack(activeIndex) {
    const cards = document.querySelectorAll('.track-card');
    cards.forEach((card, index) => {
        if (index === activeIndex) {
            card.style.opacity = '1';
            card.style.transform = 'scale(1.05)';
            card.style.transition = 'all 0.3s ease';
        } else {
            card.style.opacity = '0.7';
            card.style.transform = 'scale(1)';
        }
    });
}

// ==================== RECHERCHE ====================
/**
 * Filtre les pistes selon la recherche
 * @param {string} searchTerm - Terme de recherche
 */
function filterTracks(searchTerm) {
    const filtered = tracks.filter(track => 
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Afficher uniquement les pistes filtrées
    const cards = document.querySelectorAll('.track-card');
    cards.forEach((card, index) => {
        const track = tracks[index];
        const matches = filtered.includes(track);
        card.style.display = matches ? 'flex' : 'none';
    });
}

// ==================== GESTION DES ERREURS ====================
/**
 * Affiche un message d'erreur temporaire
 * @param {string} message - Message à afficher
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// ==================== INITIALISATION DES ÉVÉNEMENTS ====================
/**
 * Attache tous les écouteurs d'événements
 */
function attachEventListeners() {
    // Contrôles principaux
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // Barre de progression
    progressBar.addEventListener('click', seekTrack);
    
    // Like button
    likeBtn.addEventListener('click', () => {
        const isLiked = likeBtn.style.color === 'red';
        likeBtn.style.color = isLiked ? 'var(--text-secondary)' : 'red';
    });
    
    // Recherche
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterTracks(e.target.value);
            }, 300);
        });
    }
    
    // Gestion des erreurs réseau pour les images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://via.placeholder.com/300/1e1e2f/ffffff?text=Album';
        });
    });
}

// ==================== INITIALISATION PRINCIPALE ====================
/**
 * Initialise l'application
 */
function init() {
    try {
        // Initialiser le lecteur audio
        initAudioPlayer();
        
        // Afficher la liste des pistes
        renderTrackList();
        
        // Attacher les événements
        attachEventListeners();
        
        console.log("Application initialisée avec succès");
    } catch (error) {
        console.error("Erreur d'initialisation:", error);
        showErrorMessage("Erreur lors du chargement de l'application");
    }
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', init);

// ==================== STYLES DYNAMIQUES ====================
// Ajouter les animations CSS nécessaires
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translate(-50%, 100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
    
    .track-card {
        transition: all 0.3s ease;
    }
    
    .track-card:hover {
        transform: translateY(-5px);
    }
    
    .error-toast {
        box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
    }
`;

document.head.appendChild(style);
