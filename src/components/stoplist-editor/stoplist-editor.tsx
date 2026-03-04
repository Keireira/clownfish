import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useLanguage } from '../../i18n';
import type { StopListEntry } from '../../types';

type RunningApp = { exe: string; title: string };

type Props = {
	entries: StopListEntry[];
	onChange: (entries: StopListEntry[]) => void;
};

const Root = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	position: relative;
`;

const Label = styled.label`
	display: block;
	font-size: 11px;
	font-weight: 600;
	color: var(--text-label);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const Table = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

const Row = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 8px;
	border-radius: 6px;
	background: var(--fill);
	font-size: 12px;

	&:hover button {
		opacity: 1;
	}
`;

const Exe = styled.span`
	flex: 1;
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 11px;
	color: var(--text-primary);
`;

const Check = styled.label`
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 11px;
	color: var(--text-secondary);
	cursor: pointer;
	white-space: nowrap;

	input {
		accent-color: var(--accent);
	}
`;

const DeleteBtn = styled.button`
	all: unset;
	cursor: pointer;
	color: var(--text-tertiary);
	font-size: 14px;
	line-height: 1;
	opacity: 0;
	transition: opacity 0.1s;

	&:hover {
		color: var(--red);
	}
`;

const DropOverlay = styled.div`
	position: absolute;
	inset: 0;
	z-index: 50;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px dashed var(--accent-border);
	border-radius: 8px;
	background: color-mix(in srgb, var(--accent) 8%, transparent);
	color: var(--accent);
	font-size: 12px;
	pointer-events: none;
`;

const AddBtn = styled.button`
	padding: 6px 12px;
	font-size: 12px;
	background: var(--fill);
	color: var(--text-tertiary);
	border: 1px solid var(--border-medium);
	border-radius: 6px;
	cursor: pointer;
	font-weight: 500;
	align-self: flex-start;

	&:hover {
		background: var(--fill-hover);
	}
`;

const EmptyState = styled.p`
	font-size: 12px;
	color: var(--text-tertiary);
	text-align: center;
	padding: 12px 0;
`;

/* ---- Dropdown ---- */

const DropdownWrap = styled.div`
	position: relative;
	align-self: flex-start;
`;

const Dropdown = styled.div`
	position: absolute;
	z-index: 100;
	bottom: calc(100% + 4px);
	left: 0;
	width: 340px;
	max-height: 260px;
	overflow: hidden;
	background: var(--bg-elevated);
	border: 1px solid var(--border-medium);
	border-radius: 8px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
	display: flex;
	flex-direction: column;
`;

const SearchInput = styled.input`
	padding: 8px 10px;
	border: none;
	border-bottom: 1px solid var(--border-medium);
	background: transparent;
	color: var(--text-primary);
	font-size: 12px;
	outline: none;
`;

const AppList = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 4px;
`;

const AppRow = styled.button<{ $disabled?: boolean }>`
	all: unset;
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	box-sizing: border-box;
	padding: 6px 8px;
	border-radius: 5px;
	cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
	opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
	font-size: 12px;

	&:hover {
		background: ${({ $disabled }) => ($disabled ? 'transparent' : 'var(--fill-hover)')};
	}
`;

const AppExe = styled.span`
	font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 11px;
	color: var(--text-primary);
	white-space: nowrap;
`;

const AppTitle = styled.span`
	color: var(--text-tertiary);
	font-size: 11px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
	min-width: 0;
`;

const NoApps = styled.p`
	font-size: 12px;
	color: var(--text-tertiary);
	text-align: center;
	padding: 16px 0;
`;

const StopListEditor = ({ entries, onChange }: Props) => {
	const t = useLanguage();
	const [open, setOpen] = useState(false);
	const [apps, setApps] = useState<RunningApp[]>([]);
	const [search, setSearch] = useState('');
	const [dragging, setDragging] = useState(false);
	const dropRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const entriesRef = useRef(entries);
	entriesRef.current = entries;
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	// Fetch running apps when dropdown opens.
	useEffect(() => {
		if (!open) return;
		invoke<RunningApp[]>('expansion_list_running_apps')
			.then(setApps)
			.catch(() => setApps([]));
	}, [open]);

	// Focus search on open.
	useEffect(() => {
		if (open) searchRef.current?.focus();
	}, [open]);

	// Close on outside click.
	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	// Tauri drag-drop: listen for file drops on the window.
	const addExe = useCallback((exe: string) => {
		const lower = exe.toLowerCase();
		const cur = entriesRef.current;
		if (cur.some((e) => e.exe.toLowerCase() === lower)) return;
		onChangeRef.current([...cur, { exe: lower, expansion: false, hints: false }]);
	}, []);

	useEffect(() => {
		let unlisten: (() => void) | undefined;
		getCurrentWebviewWindow()
			.onDragDropEvent((event) => {
				if (event.payload.type === 'over') {
					setDragging(true);
				} else if (event.payload.type === 'drop') {
					setDragging(false);
					for (const path of event.payload.paths) {
						invoke<string | null>('expansion_resolve_exe', { path })
							.then((exe) => { if (exe) addExe(exe); })
							.catch(() => {});
					}
				} else {
					setDragging(false);
				}
			})
			.then((fn) => { unlisten = fn; });
		return () => { unlisten?.(); };
	}, [addExe]);

	const alreadyAdded = new Set(entries.map((e) => e.exe.toLowerCase()));

	const filtered = apps.filter((a) => {
		const q = search.toLowerCase();
		return a.exe.includes(q) || a.title.toLowerCase().includes(q);
	});

	const handleAdd = (exe: string) => {
		if (alreadyAdded.has(exe.toLowerCase())) return;
		onChange([...entries, { exe: exe.toLowerCase(), expansion: false, hints: false }]);
		setOpen(false);
		setSearch('');
	};

	const handleToggle = (idx: number, field: 'expansion' | 'hints') => {
		onChange(
			entries.map((e, i) =>
				i === idx ? { ...e, [field]: !e[field] } : e
			)
		);
	};

	const handleDelete = (idx: number) => {
		onChange(entries.filter((_, i) => i !== idx));
	};

	return (
		<Root>
			<Label>{t('stoplist_label')}</Label>

			{entries.length === 0 && <EmptyState>{t('stoplist_empty')}</EmptyState>}

			<Table>
				{entries.map((entry, idx) => (
					<Row key={entry.exe}>
						<Exe>{entry.exe}</Exe>
						<Check>
							<input
								type="checkbox"
								checked={entry.expansion}
								onChange={() => handleToggle(idx, 'expansion')}
							/>
							{t('stoplist_expansion')}
						</Check>
						<Check>
							<input
								type="checkbox"
								checked={entry.hints}
								onChange={() => handleToggle(idx, 'hints')}
							/>
							{t('stoplist_hints')}
						</Check>
						<DeleteBtn onClick={() => handleDelete(idx)}>&times;</DeleteBtn>
					</Row>
				))}
			</Table>

			<DropdownWrap ref={dropRef}>
				<AddBtn onClick={() => setOpen(!open)}>
					+ {t('stoplist_add_app')}
				</AddBtn>

				{open && (
					<Dropdown>
						<SearchInput
							ref={searchRef}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder={t('stoplist_search_placeholder') as string}
						/>
						<AppList>
							{filtered.length === 0 && <NoApps>{t('stoplist_no_apps')}</NoApps>}
							{filtered.map((app) => {
								const added = alreadyAdded.has(app.exe.toLowerCase());
								return (
									<AppRow
										key={app.exe}
										$disabled={added}
										onClick={() => !added && handleAdd(app.exe)}
									>
										<AppExe>{app.exe}</AppExe>
										<AppTitle>{app.title}</AppTitle>
									</AppRow>
								);
							})}
						</AppList>
					</Dropdown>
				)}
			</DropdownWrap>

			{dragging && <DropOverlay>{t('stoplist_drop_hint')}</DropOverlay>}
		</Root>
	);
};

export default StopListEditor;
