import { useState, useEffect, useRef, useCallback } from 'react';
import { getBootTimeMs } from '../commands/processSystem';

/**
 * Hook personnalisé gérant le temps de fonctionnement (uptime) du système.
 * Il récupère l'heure de démarrage depuis `processSystem` et met à jour
 * régulièrement un compteur pour affichage.
 *
 * @returns {Object} Les propriétés temporelles liées au temps d'activité.
 * @returns {number} return.uptimeMs - Temps écoulé en millisecondes depuis le boot.
 * @returns {string} return.formattedUptime - Temps écoulé formaté en HH:MM:SS.
 * @returns {Function} return.formatUptime - Fonction pour formater un montant en MS en format HH:MM:SS.
 */
export function useUptime() {
    const [uptimeMs, setUptimeMs] = useState(0);
    const osStartedAtRef = useRef(Date.now());

    useEffect(() => {
        osStartedAtRef.current = getBootTimeMs();
        const uptimeInterval = setInterval(() => {
            setUptimeMs(Date.now() - osStartedAtRef.current);
        }, 50);

        return () => clearInterval(uptimeInterval);
    }, []);

    const formatUptime = useCallback((milliseconds) => {
        const totalMs = Math.max(0, milliseconds);
        const hours = Math.floor(totalMs / 3600000).toString().padStart(2, '0');
        const minutes = Math.floor((totalMs % 3600000) / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((totalMs % 60000) / 1000).toString().padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }, []);

    return { uptimeMs, formattedUptime: formatUptime(uptimeMs), formatUptime };
}
