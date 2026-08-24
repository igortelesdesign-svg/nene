import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { onInstallPromptChange, promptPWAInstall, isPWAStandalone } from '../../pwa';
import { AppIcon } from './AppIcon';

export const InstallBanner: React.FC = () => {
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);

  useEffect(() => {
    setIsStandalone(isPWAStandalone());
    const unsubscribe = onInstallPromptChange((promptAvailable) => {
      setCanInstall(promptAvailable);
    });
    return () => unsubscribe();
  }, []);

  if (isStandalone || isDismissed) return null;

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  const handleInstallClick = async () => {
    if (canInstall) {
      const accepted = await promptPWAInstall();
      if (accepted) {
        setIsDismissed(true);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  return (
    <>
      <div
        id="pwa-install-banner"
        className="mx-4 my-2 p-3 bg-[#133A34] text-[#FFF6EE] rounded-2xl shadow-md border border-[#133A34]/20 flex items-center justify-between gap-3 animate-in fade-in"
      >
        <div className="flex items-center gap-3 min-w-0">
          <AppIcon size={38} className="rounded-xl shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">Instalar o NENÊ</div>
            <div className="text-[11px] text-[#89A589] truncate">
              Acesso rápido e offline na tela inicial
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="pwa-install-action-btn"
            onClick={handleInstallClick}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-[#F08A6B] hover:bg-[#e0795c] text-[#FFF6EE] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Instalar</span>
          </button>
          <button
            id="pwa-dismiss-banner-btn"
            onClick={() => setIsDismissed(true)}
            type="button"
            className="p-1.5 text-[#FFF6EE]/60 hover:text-[#FFF6EE] cursor-pointer rounded-lg"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* iOS Instructions modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FFF6EE] rounded-3xl p-5 border border-[#133A34]/10 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#133A34]">Instalar no iPhone / iPad</h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1 text-[#133A34]/70 hover:text-[#133A34] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#133A34]/80 mb-4">
              Para instalar o NENÊ e usar como aplicativo no seu iOS:
            </p>
            <div className="space-y-3 text-xs text-[#133A34]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#133A34] text-[#FFF6EE] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Toque no botão <strong>Compartilhar</strong> <Share size={14} className="inline mx-1 text-[#133A34]" /> na barra do Safari.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#133A34] text-[#FFF6EE] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Role para baixo e selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare size={14} className="inline mx-1 text-[#133A34]" />.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#133A34] text-[#FFF6EE] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#133A34] text-[#FFF6EE] text-xs font-bold cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
