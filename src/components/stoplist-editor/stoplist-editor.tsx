import { useState, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useLanguage } from '../../i18n';
import type { StopListEntry, CompassDirection, HintsOffset } from '../../types';
import {
	Root,
	Label,
	Table,
	Card,
	CardHeader,
	CardBody,
	ExpandBtn,
	Exe,
	DeleteBtn,
	ToggleGroup,
	ToggleTrack,
	ToggleKnob,
	ToggleText,
	DropOverlay,
	AddBtn,
	EmptyState,
	DetailPanel,
	DetailSection,
	DetailLabel,
	CompassGrid,
	CompassCell,
	OffsetGroup,
	OffsetRow,
	OffsetLabel,
	OffsetInput,
	OffsetUnit,
	DropdownWrap,
	Dropdown,
	SearchInput,
	AppList,
	AppRow,
	AppExe,
	AppTitle,
	NoApps
} from './stoplist-editor.styles';

type RunningApp = { exe: string; title: string };

type Props = {
	entries: StopListEntry[];
	onChange: (entries: StopListEntry[]) => void;
};

const DEFAULT_ENTRY: Omit<StopListEntry, 'exe'> = {
	expansion: true,
	hints: true,
	direction: 'auto',
	offset: { top: 0, bottom: 0, left: 0, right: 0 }
};

/* ---- Compass grid data ---- */

const COMPASS_GRID: CompassDirection[] = ['NW', 'N', 'NE', 'W', 'auto', 'E', 'SW', 'S', 'SE'];

const COMPASS_LABELS: Record<CompassDirection, string> = {
	NW: '\u2196',
	N: '\u2191',
	NE: '\u2197',
	W: '\u2190',
	auto: '~',
	E: '\u2192',
	SW: '\u2199',
	S: '\u2193',
	SE: '\u2198'
};

const OFFSET_SIDES = ['top', 'bottom', 'left', 'right'] as const;
const OFFSET_LABELS_MAP: Record<string, string> = { top: 'T', bottom: 'B', left: 'L', right: 'R' };

/* ---- Component ---- */

const StopListEditor = ({ entries, onChange }: Props) => {
	const t = useLanguage();
	const [open, setOpen] = useState(false);
	const [apps, setApps] = useState<RunningApp[]>([]);
	const [search, setSearch] = useState('');
	const [dragging, setDragging] = useState(false);
	const [expandedExe, setExpandedExe] = useState<string | null>(null);
	const dropRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const entriesRef = useRef(entries);
	const onChangeRef = useRef(onChange);

	useEffect(() => {
		entriesRef.current = entries;
		onChangeRef.current = onChange;
	}, [entries, onChange]);

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

	// Tauri drag-drop.
	const addExe = useCallback((exe: string) => {
		const lower = exe.toLowerCase();
		const cur = entriesRef.current;
		if (cur.some((e) => e.exe.toLowerCase() === lower)) return;
		onChangeRef.current([...cur, { exe: lower, ...DEFAULT_ENTRY }]);
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
							.then((exe) => {
								if (exe) addExe(exe);
							})
							.catch(() => {});
					}
				} else {
					setDragging(false);
				}
			})
			.then((fn) => {
				unlisten = fn;
			});
		return () => {
			unlisten?.();
		};
	}, [addExe]);

	const alreadyAdded = new Set(entries.map((e) => e.exe.toLowerCase()));

	const filtered = apps.filter((a) => {
		const q = search.toLowerCase();
		return a.exe.includes(q) || a.title.toLowerCase().includes(q);
	});

	const handleAdd = (exe: string) => {
		if (alreadyAdded.has(exe.toLowerCase())) return;
		onChange([...entries, { exe: exe.toLowerCase(), ...DEFAULT_ENTRY }]);
		setOpen(false);
		setSearch('');
	};

	const handleToggle = (idx: number, field: 'expansion' | 'hints') => {
		onChange(
			entries.map((e, i) => {
				if (i !== idx) return e;
				const newVal = !e[field];
				// Disabling expansion automatically disables hints
				if (field === 'expansion' && !newVal) {
					return { ...e, expansion: false, hints: false };
				}
				return { ...e, [field]: newVal };
			})
		);
	};

	const handleDelete = (idx: number) => {
		onChange(entries.filter((_, i) => i !== idx));
	};

	const handleDirection = (idx: number, direction: CompassDirection) => {
		onChange(entries.map((e, i) => (i === idx ? { ...e, direction } : e)));
	};

	const handleOffset = (idx: number, side: keyof HintsOffset, value: number) => {
		onChange(entries.map((e, i) => (i === idx ? { ...e, offset: { ...e.offset, [side]: value } } : e)));
	};

	return (
		<Root>
			<Label>{t('stoplist_label')}</Label>

			{entries.length === 0 && <EmptyState>{t('stoplist_empty')}</EmptyState>}

			<Table>
				{entries.map((entry, idx) => {
					const expansionDisabled = !entry.expansion;
					const hintsDisabled = !entry.hints;
					return (
						<Card key={entry.exe}>
							<CardHeader>
								<ExpandBtn onClick={() => setExpandedExe(expandedExe === entry.exe ? null : entry.exe)}>
									{expandedExe === entry.exe ? '\u25BE' : '\u25B8'}
								</ExpandBtn>
								<Exe>{entry.exe}</Exe>
								<DeleteBtn data-delete onClick={() => handleDelete(idx)}>
									&times;
								</DeleteBtn>
							</CardHeader>
							<CardBody>
								<ToggleGroup onClick={() => handleToggle(idx, 'expansion')}>
									<ToggleTrack $on={expansionDisabled}>
										<ToggleKnob $on={expansionDisabled} />
									</ToggleTrack>
									<ToggleText>{t('stoplist_expansion')}</ToggleText>
								</ToggleGroup>
								<ToggleGroup
									$dimmed={expansionDisabled}
									onClick={() => !expansionDisabled && handleToggle(idx, 'hints')}
								>
									<ToggleTrack $on={hintsDisabled}>
										<ToggleKnob $on={hintsDisabled} />
									</ToggleTrack>
									<ToggleText>{t('stoplist_hints')}</ToggleText>
								</ToggleGroup>
							</CardBody>
							{expandedExe === entry.exe && (
								<DetailPanel>
									<DetailSection>
										<DetailLabel>{t('stoplist_direction')}</DetailLabel>
										<CompassGrid>
											{COMPASS_GRID.map((dir) => (
												<CompassCell
													key={dir}
													$active={entry.direction === dir}
													onClick={() => handleDirection(idx, dir)}
													title={dir}
												>
													{COMPASS_LABELS[dir]}
												</CompassCell>
											))}
										</CompassGrid>
									</DetailSection>
									<DetailSection>
										<DetailLabel>{t('stoplist_offset')}</DetailLabel>
										<OffsetGroup>
											{OFFSET_SIDES.map((side) => (
												<OffsetRow key={side}>
													<OffsetLabel>{OFFSET_LABELS_MAP[side]}</OffsetLabel>
													<OffsetInput
														type="number"
														value={entry.offset[side]}
														onChange={(e) => handleOffset(idx, side, parseInt(e.target.value) || 0)}
													/>
													<OffsetUnit>px</OffsetUnit>
												</OffsetRow>
											))}
										</OffsetGroup>
									</DetailSection>
								</DetailPanel>
							)}
						</Card>
					);
				})}
			</Table>

			<DropdownWrap ref={dropRef}>
				<AddBtn onClick={() => setOpen(!open)}>+ {t('stoplist_add_app')}</AddBtn>

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
									<AppRow key={app.exe} $disabled={added} onClick={() => !added && handleAdd(app.exe)}>
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
