import { createContext, useContext } from 'react';

// Seçili zikir ve ayarları paylaşan global context (App.js import döngüsünü kırmak için ayrı dosya)
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
