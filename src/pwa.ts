// PWA Lifecycle and installation listener
let deferredPrompt: any = null;
const installListeners: Array<(canInstall: boolean) => void> = [];

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[NENÊ PWA] Service Worker registrado com sucesso:', reg.scope);
        })
        .catch((err) => {
          console.warn('[NENÊ PWA] Falha ao registrar Service Worker:', err);
        });
    });
  }

  // Listen for beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installListeners.forEach((listener) => listener(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installListeners.forEach((listener) => listener(false));
    console.log('[NENÊ PWA] Aplicativo instalado com sucesso na tela inicial!');
  });
}

export function onInstallPromptChange(callback: (canInstall: boolean) => void) {
  installListeners.push(callback);
  callback(deferredPrompt !== null);
  return () => {
    const index = installListeners.indexOf(callback);
    if (index > -1) {
      installListeners.splice(index, 1);
    }
  };
}

export async function promptPWAInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installListeners.forEach((listener) => listener(false));
  return outcome === 'accepted';
}

export function isPWAStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}
