import { createRoot } from 'react-dom/client';
import { Component, type ReactNode } from 'react';
import './theme.css';
import { initTheme } from './theme';
import { initLanguage } from './i18n';

// Kick off theme init (localStorage inline script prevents flash; this confirms from store)
initTheme();
initLanguage();

// Sync text expansion shortcuts and enabled state to Rust backend on startup
(async () => {
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		const { loadShortcuts, loadExpansionEnabled, loadHintsPosition, loadStopList } = await import('./store');
		const [shortcuts, enabled, hintsPos, stopList] = await Promise.all([
			loadShortcuts(), loadExpansionEnabled(), loadHintsPosition(), loadStopList(),
		]);
		await invoke('expansion_update_shortcuts', { shortcuts });
		await invoke('expansion_set_enabled', { enabled });
		await invoke('expansion_set_hints_mode', { mode: hintsPos });
		await invoke('expansion_update_stoplist', { entries: stopList });
	} catch (err) {
		console.error('Failed to init text expansion:', err);
	}
})();

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null };
	}
	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	render() {
		if (this.state.error) {
			return (
				<div
					style={{
						background: '#ff0000',
						color: '#fff',
						padding: 16,
						fontSize: 13,
						fontFamily: 'monospace',
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-all',
						borderRadius: 8
					}}
				>
					<b>React Error:</b>
					{'\n'}
					{this.state.error.message}
					{'\n'}
					{this.state.error.stack}
				</div>
			);
		}
		return this.props.children;
	}
}

const root = createRoot(document.getElementById('root')!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const label = (window as any).__TAURI_INTERNALS__?.metadata?.currentWindow?.label as string | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isSettings = (window as any).__IS_SETTINGS_WINDOW__ || label === 'settings';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isHints = (window as any).__IS_HINTS_WINDOW__ || label === 'hints';

if (isHints) {
	import('./hints')
		.then(({ default: Hints }) => {
			root.render(<Hints />);
		})
		.catch(() => {});
} else if (isSettings) {
	import('./settings')
		.then(({ default: Settings }) => {
			root.render(
				<ErrorBoundary>
					<Settings />
				</ErrorBoundary>
			);
		})
		.catch((e) => {
			root.render(<div style={{ color: 'red', padding: 16 }}>Settings load error: {String(e)}</div>);
		});
} else {
	import('./app')
		.then(({ default: App }) => {
			root.render(
				<ErrorBoundary>
					<App />
				</ErrorBoundary>
			);
		})
		.catch((e) => {
			root.render(<div style={{ color: 'red', padding: 16 }}>App load error: {String(e)}</div>);
		});
}
