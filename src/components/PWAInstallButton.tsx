import React, { useState } from 'react';
import { MonitorSmartphone, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DialTheme } from '../types/calendar';

interface PWAInstallButtonProps {
  theme: DialTheme;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ theme }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const isInIframe =
    typeof window !== 'undefined' && window.self !== window.top;

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border transition-colors hover:opacity-85 whitespace-nowrap shrink-0 cursor-pointer"
        style={{
          borderColor: theme.inkSubtle,
          color: theme.ink,
          backgroundColor: theme.pageBg,
        }}
        title="Install Spiral Calendar as an app"
      >
        <MonitorSmartphone className="w-3.5 h-3.5" />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border p-6 shadow-2xl"
            style={{
              backgroundColor: theme.panelBg,
              borderColor: theme.inkSubtle,
              color: theme.ink,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/pwa-192x192.png"
                  alt="Spiral Calendar icon"
                  className="w-14 h-14 rounded-2xl shadow-md shrink-0 border"
                  style={{ borderColor: theme.inkSubtle }}
                />
                <div>
                  <h3 className="font-dial text-lg font-bold leading-tight">
                    Spiral Calendar
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: theme.inkMuted }}
                  >
                    Orbis Desktop &amp; Mobile App
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install instructions"
                className="p-1 rounded-md hover:opacity-75 cursor-pointer"
                style={{ color: theme.inkMuted }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <ol
                className="mt-5 space-y-2.5 text-sm leading-relaxed"
                style={{ color: theme.inkMuted }}
              >
                <li>
                  1. Tap the{' '}
                  <strong style={{ color: theme.ink }}>
                    Share <Share className="inline w-3.5 h-3.5 -mt-0.5" />
                  </strong>{' '}
                  button in Safari&apos;s toolbar.
                </li>
                <li>
                  2. Scroll down and tap{' '}
                  <strong style={{ color: theme.ink }}>
                    Add to Home Screen
                  </strong>
                  .
                </li>
                <li>
                  3. Confirm the name{' '}
                  <strong style={{ color: theme.ink }}>Spiral Calendar</strong>{' '}
                  and tap <strong style={{ color: theme.ink }}>Add</strong>.
                </li>
              </ol>
            ) : (
              <div
                className="mt-5 space-y-2.5 text-sm leading-relaxed"
                style={{ color: theme.inkMuted }}
              >
                {isInIframe && (
                  <p>
                    1. Open the app in its own browser tab (browsers block
                    install prompts inside embedded preview frames).
                  </p>
                )}
                <p>
                  {isInIframe ? '2.' : '1.'} In Chrome or Edge, click the{' '}
                  <strong style={{ color: theme.ink }}>Install</strong> icon in
                  the address bar (or open the browser menu and select{' '}
                  <strong style={{ color: theme.ink }}>
                    Install Spiral Calendar
                  </strong>
                  ).
                </p>
                <p>
                  {isInIframe ? '3.' : '2.'} On Android Chrome, tap{' '}
                  <strong style={{ color: theme.ink }}>
                    Add to Home screen
                  </strong>{' '}
                  for full offline access.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-lg py-2 text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer"
              style={{
                backgroundColor: theme.cellSelectedBg,
                color: theme.cellSelectedText,
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
