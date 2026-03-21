export const executeRestart = (args) => {
	// Fermer le terminal principal via une commande d'évènement
	const restartEvent = new CustomEvent('tz-restart-system', {
		detail: {}
	});

	window.dispatchEvent(restartEvent);

	return null;
};

export const setupRestartListener = (handler) => {
	window.addEventListener('tz-restart-system', handler);

	return () => window.removeEventListener('tz-restart-system', handler);
};
