import { createContext } from "react";

/**
 * Contexte React utilisé pour le gestionnaire de fenêtres du système (Window Manager).
 * Permet aux applications et aux terminaux de manipuler l'état des fenêtres
 * (ouverture, mise au premier plan, fermeture) sans propager (prop-drilling)
 * les props à travers toute l'application.
 * 
 * @type {React.Context<any>}
 */
export const WindowContext = createContext(null);
