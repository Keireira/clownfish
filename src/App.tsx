import { useState, useCallback, useRef, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { CATEGORIES as DEFAULT_CATEGORIES } from "./data/characters";
import SearchBar from "./components/SearchBar";
import Category from "./components/Category";
import Toast from "./components/Toast";
import { useLanguage, getLanguageChoice, applyLanguage } from "./i18n";
import type { Category as CategoryType } from "./types";

const AppGlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    background: transparent;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
    user-select: none;
    -webkit-user-select: none;
    margin: 0;
    padding: 0;
  }
`;

const AppWrapper = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-l);
  box-shadow: var(--glass-shadow);
  padding: 12px;
  width: 420px;
  max-height: 520px;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
`;

const GridArea = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 3px;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 24px 0;
  color: var(--text-disabled);
  font-size: 13px;
`;

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid var(--border);
`;

const BottomBarBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: var(--text-bright);
    background: var(--fill);
  }

  svg {
    flex-shrink: 0;
  }
`;

const MAX_HEIGHT = 520;
const WIDTH = 420;

export default function App() {
  const t = useLanguage();
  const [categories, setCategories] = useState<CategoryType[]>(DEFAULT_CATEGORIES);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const lastHeight = useRef(0);

  // Load categories from store on mount and on focus
  useEffect(() => {
    let cancelled = false;
    let unlistenPromise: Promise<() => void> | undefined;

    async function load() {
      try {
        const { loadCategories } = await import("./store");
        const cats = await loadCategories();
        if (!cancelled) setCategories(cats);
      } catch (e) {
        console.error("Store load failed:", e);
      }
    }
    load();

    // Listen for explicit categories-changed event from settings window
    let unlistenCatsPromise: Promise<() => void> | undefined;
    import("@tauri-apps/api/event")
      .then(({ listen }) => {
        if (cancelled) return;
        unlistenCatsPromise = listen("categories-changed", () => {
          load();
        });
      })
      .catch((e) => console.error("Event listener setup failed:", e));

    // Listen for window focus to reload theme/language
    import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => {
        if (cancelled) return;
        const win = getCurrentWindow();
        unlistenPromise = win.onFocusChanged(({ payload: focused }) => {
          if (!focused) return;
          load();
          import("./theme").then(({ getThemeChoice, applyTheme }) => {
            getThemeChoice().then(applyTheme);
          });
          getLanguageChoice().then(applyLanguage);
        });
      })
      .catch((e) => console.error("Focus listener setup failed:", e));

    return () => {
      cancelled = true;
      if (unlistenPromise) unlistenPromise.then((fn) => fn()).catch(() => {});
      if (unlistenCatsPromise) unlistenCatsPromise.then((fn) => fn()).catch(() => {});
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1200);
  }, []);

  // Resize the Tauri window to fit content
  useEffect(() => {
    const el = appRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const height = Math.min(el.scrollHeight, MAX_HEIGHT);
      if (Math.abs(height - lastHeight.current) < 2) return;
      lastHeight.current = height;
      import("@tauri-apps/api/window")
        .then(({ getCurrentWindow, LogicalSize }) => {
          getCurrentWindow().setSize(new LogicalSize(WIDTH, height));
        })
        .catch(() => {});
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const q = query.toLowerCase().trim();

  const filtered = categories
    .map((cat) => {
      if (!q) return cat;
      const categoryMatch = cat.name.toLowerCase().includes(q);
      const matchedChars = cat.chars.filter(
        ([char, name]) => categoryMatch || char.includes(q) || name.includes(q)
      );
      return { ...cat, chars: matchedChars };
    })
    .filter((cat) => cat.chars.length > 0);

  const openSettings = () => {
    import("@tauri-apps/api/core").then(({ invoke }) => {
      invoke("open_settings_cmd");
    }).catch((e) => console.error("Failed to open settings:", e));
  };

  return (
    <>
      <AppGlobalStyle />
      <AppWrapper ref={appRef}>
        <SearchBar value={query} onChange={setQuery} />
        <GridArea>
          {filtered.length > 0 ? (
            filtered.map((cat) => (
              <Category key={cat.name} category={cat} onCopy={showToast} />
            ))
          ) : (
            <NoResults>{t("nothing_found")}</NoResults>
          )}
        </GridArea>
        <BottomBar>
          <BottomBarBtn onClick={openSettings} title="Settings">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.062 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
            </svg>
            <span>{t("settings")}</span>
          </BottomBarBtn>
        </BottomBar>
        <Toast message={toast} />
      </AppWrapper>
    </>
  );
}
