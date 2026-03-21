// Import des sons à précharger
import confirm from "./../assets/sounds/confirm.wav";
import ding from "./../assets/sounds/ding.wav";
import box_sizing from "./../assets/sounds/box_sizing.wav";
import beep_flash from "./../assets/sounds/beep_flash.wav";
import close_window from "./../assets/sounds/close_window.wav";
import applied from "./../assets/sounds/applied.wav";
import beep_error from "./../assets/sounds/beep_error.wav";
import boot from "./../assets/sounds/boot.wav";
import bgMusic1 from "./../assets/sounds/background-music.wav";
import bgMusic2 from "./../assets/sounds/background-music-2.wav";
import bgMusic3 from "./../assets/sounds/music-background-3.wav";

// Liste de tous les sons à précharger
const soundsToPreload = [
    confirm,
    ding,
    box_sizing,
    beep_flash,
    close_window,
    applied,
    beep_error,
    boot,
    bgMusic1,
    bgMusic2,
    bgMusic3
];

/**
 * Précharge tous les sons de l'application
 */
export const preloadSounds = () => {
    return Promise.all(soundsToPreload.map(soundPath => {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.addEventListener('canplaythrough', () => resolve(soundPath), { once: true });
            audio.addEventListener('error', () => reject(soundPath), { once: true });
            audio.src = soundPath;
            audio.preload = 'auto';
        });
    })).catch(err => {
        console.warn('Erreur lors du préchargement des sons:', err);
        // Ne pas bloquer l'app si le préchargement échoue
        return Promise.resolve();
    });
};

/**
 * Précharge les polices d'écriture
 */
export const preloadFonts = () => {
    return Promise.all([
        document.fonts.load('16px "Tamzen"'),
        document.fonts.load('16px "Terminus"'),
        document.fonts.load('16px monospace')
    ]).catch(err => {
        console.warn('Erreur lors du préchargement des polices:', err);
        // Ne pas bloquer l'app si le préchargement échoue
        return Promise.resolve();
    });
};

/**
 * Précharge tous les assets (sons + polices)
 */
export const preloadAllAssets = () => {
    console.log('🎬 Démarrage du préchargement des assets...');
    return Promise.all([
        preloadFonts(),
        preloadSounds()
    ]).then(() => {
        console.log('✅ Assets préchargés avec succès');
    }).catch(err => {
        console.warn('⚠️ Erreur lors du préchargement des assets:', err);
    });
};
