import { useState, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useLanguage, translateCategoryName } from '../../i18n';
import type { Plugin, PluginId, PluginRegistryEntry, StopListEntry } from '../../types';
import SidebarRoot, {
	SectionItems,
	SectionItem,
	SectionLabel,
	Divider,
	GroupHeader,
	GroupChevron,
	Collapsible,
	GroupItems,
	CatItem,
	CatGrip,
	CatName,
	CatCount,
	CatDeleteBtn,
	CatPlaceholder,
	DragGhost,
	AppItem,
	AppDeleteBtn,
	EmptyApps,
	AddBtn,
	DropdownWrap,
	Dropdown,
	SearchInput,
	DropAppList,
	DropAppRow,
	DropAppExe,
	DropAppTitle,
	NoApps,
	BottomSpacer,
	ShortcutsItem,
	ShortcutsIcon,
	CatSubLabel,
	PluginToggle,
	PluginGroupHeader,
	PluginGroupName,
	PluginGroupRight
} from './settings-sidebar.styles';

type RunningApp = { exe: string; title: string };

const DEFAULT_ENTRY: Omit<StopListEntry, 'exe'> = {
	expansion: true,
	hints: true,
	direction: 'auto',
	offset: { top: 0, bottom: 0, left: 0, right: 0 }
};

export type ActiveSection = string;
// Values:
//   'plugins' | 'settings'
//   `shortcuts:${pluginId}`
//   `cat:${pluginId}:${catIdx}`
//   app exe name

export function parseCategorySection(s: string): { pluginId: PluginId; catIdx: number } | null {
	if (!s.startsWith('cat:')) return null;
	const rest = s.slice(4);
	const colonIdx = rest.lastIndexOf(':');
	if (colonIdx < 0) return null;
	return { pluginId: rest.slice(0, colonIdx), catIdx: parseInt(rest.slice(colonIdx + 1), 10) };
}

export function parseShortcutsSection(s: string): { pluginId: PluginId } | null {
	if (!s.startsWith('shortcuts:')) return null;
	return { pluginId: s.slice(10) };
}

export function categorySection(pluginId: PluginId, idx: number): string {
	return `cat:${pluginId}:${idx}`;
}

export function shortcutsSection(pluginId: PluginId): string {
	return `shortcuts:${pluginId}`;
}

type Props = {
	active: ActiveSection;
	onSelect: (section: ActiveSection) => void;
	// Plugins
	plugins: Plugin[];
	registry: PluginRegistryEntry[];
	onTogglePlugin: (id: PluginId, enabled: boolean) => void;
	// Categories (within a plugin)
	onAddCategory: (pluginId: PluginId) => void;
	onDeleteCategory: (pluginId: PluginId, idx: number) => void;
	onReorderCategory: (pluginId: PluginId, from: number, to: number) => void;
	// Apps
	stopList: StopListEntry[];
	onStopListChange: (entries: StopListEntry[]) => void;
};

const SettingsSidebar = ({
	active,
	onSelect,
	plugins,
	registry,
	onTogglePlugin,
	onAddCategory,
	onDeleteCategory,
	onReorderCategory,
	stopList,
	onStopListChange
}: Props) => {
	const t = useLanguage();

	/* ---- Collapsible groups ---- */
	const [pluginOpen, setPluginOpen] = useState<Record<PluginId, boolean>>({});
	const [appsOpen, setAppsOpen] = useState(true);

	const isPluginOpen = (id: PluginId) => pluginOpen[id] !== false; // default open

	const togglePluginOpen = (id: PluginId) => {
		setPluginOpen((prev) => ({ ...prev, [id]: !isPluginOpen(id) }));
	};

	/* ---- Category drag-drop ---- */
	const [dragPluginId, setDragPluginId] = useState<PluginId | null>(null);
	const [dragIdx, setDragIdx] = useState<number | null>(null);
	const [dropSlot, setDropSlot] = useState<number | null>(null);
	const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
	const catRefs = useRef<Map<string, HTMLDivElement>>(new Map());
	const dragging = useRef(false);

	const setCatRef = useCallback((pluginId: PluginId, idx: number, el: HTMLDivElement | null) => {
		const key = `${pluginId}:${idx}`;
		if (el) catRefs.current.set(key, el);
		else catRefs.current.delete(key);
	}, []);

	const computeSlot = useCallback(
		(clientY: number, pluginId: PluginId, currentDragIdx: number, catLen: number): number | null => {
			let slot = catLen;
			for (let i = 0; i < catLen; i++) {
				const el = catRefs.current.get(`${pluginId}:${i}`);
				if (!el) continue;
				const rect = el.getBoundingClientRect();
				if (clientY < rect.top + rect.height / 2) {
					slot = i;
					break;
				}
			}
			if (slot === currentDragIdx || slot === currentDragIdx + 1) return null;
			return slot;
		},
		[]
	);

	const handleCatMouseDown = useCallback(
		(e: React.MouseEvent, pluginId: PluginId, idx: number, catLen: number) => {
			if ((e.target as HTMLElement).closest('button')) return;
			e.preventDefault();
			const startY = e.clientY;
			let started = false;

			const onMouseMove = (ev: MouseEvent) => {
				if (!started) {
					if (Math.abs(ev.clientY - startY) < 4) return;
					started = true;
					dragging.current = true;
					setDragPluginId(pluginId);
					setDragIdx(idx);
				}
				setDropSlot(computeSlot(ev.clientY, pluginId, idx, catLen));
				setGhostPos({ x: ev.clientX, y: ev.clientY });
			};

			const onMouseUp = () => {
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);

				if (!started) {
					onSelect(categorySection(pluginId, idx));
					return;
				}
				dragging.current = false;

				setDropSlot((currentSlot) => {
					if (currentSlot !== null) {
						let toIdx = currentSlot;
						if (idx < toIdx) toIdx--;
						if (toIdx !== idx) {
							setTimeout(() => onReorderCategory(pluginId, idx, toIdx), 0);
						}
					}
					return null;
				});
				setDragPluginId(null);
				setDragIdx(null);
				setGhostPos(null);
			};

			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		},
		[computeSlot, onReorderCategory, onSelect]
	);

	useEffect(() => {
		return () => {
			dragging.current = false;
		};
	}, []);

	/* ---- App add dropdown ---- */
	const [open, setOpen] = useState(false);
	const [apps, setApps] = useState<RunningApp[]>([]);
	const [search, setSearch] = useState('');
	const [dropPos, setDropPos] = useState<{ left: number; bottom: number } | null>(null);
	const dropRef = useRef<HTMLDivElement>(null);
	const addBtnRef = useRef<HTMLButtonElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!open) return;
		invoke<RunningApp[]>('expansion_list_running_apps')
			.then(setApps)
			.catch(() => setApps([]));
	}, [open]);

	useEffect(() => {
		if (open) searchRef.current?.focus();
	}, [open]);

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

	const [hlIdx, setHlIdx] = useState(-1);

	const alreadyAdded = new Set(stopList.map((e) => e.exe.toLowerCase()));

	const filtered = apps.filter((a) => {
		const q = search.toLowerCase();
		return a.exe.includes(q) || a.title.toLowerCase().includes(q);
	});

	const selectableIdxs = filtered.reduce<number[]>((acc, a, i) => {
		if (!alreadyAdded.has(a.exe.toLowerCase())) acc.push(i);
		return acc;
	}, []);

	const handleSearchKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setHlIdx((prev) => {
				const cur = selectableIdxs.indexOf(prev);
				const next = cur < selectableIdxs.length - 1 ? selectableIdxs[cur + 1] : selectableIdxs[0];
				return next ?? -1;
			});
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setHlIdx((prev) => {
				const cur = selectableIdxs.indexOf(prev);
				const next = cur > 0 ? selectableIdxs[cur - 1] : selectableIdxs[selectableIdxs.length - 1];
				return next ?? -1;
			});
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (hlIdx >= 0 && filtered[hlIdx]) {
				handleAddApp(filtered[hlIdx].exe);
			}
		} else if (e.key === 'Escape') {
			setOpen(false);
			setSearch('');
		}
	};

	const handleAddApp = (exe: string) => {
		if (alreadyAdded.has(exe.toLowerCase())) return;
		const lower = exe.toLowerCase();
		onStopListChange([...stopList, { exe: lower, ...DEFAULT_ENTRY }]);
		onSelect(lower);
		setOpen(false);
		setSearch('');
	};

	const handleDeleteApp = (idx: number) => {
		const deleted = stopList[idx];
		const next = [...stopList];
		next.splice(idx, 1);
		if (deleted.exe === active) {
			if (next.length === 0) {
				onSelect('settings');
			} else {
				const newIdx = Math.min(idx, next.length - 1);
				onSelect(next[newIdx].exe);
			}
		}
		onStopListChange(next);
	};

	/* ---- Sorted plugins by registry order ---- */
	const sortedPlugins = [...plugins].sort((a, b) => {
		const aOrder = registry.find((r) => r.id === a.id)?.order ?? 999;
		const bOrder = registry.find((r) => r.id === b.id)?.order ?? 999;
		return aOrder - bOrder;
	});

	return (
		<SidebarRoot>
			<SectionItems>
				<SectionItem $active={active === 'plugins'} onClick={() => onSelect('plugins')}>
					<SectionLabel>{t('section_plugins')}</SectionLabel>
				</SectionItem>
				<SectionItem $active={active === 'settings'} onClick={() => onSelect('settings')}>
					<SectionLabel>{t('section_settings')}</SectionLabel>
				</SectionItem>
				<SectionItem $active={active === 'stats'} onClick={() => onSelect('stats')}>
					<SectionLabel>{t('section_stats')}</SectionLabel>
				</SectionItem>
			</SectionItems>

			{sortedPlugins.map((plugin) => {
				const regEntry = registry.find((r) => r.id === plugin.id);
				const enabled = regEntry?.enabled ?? true;
				const pluginIsOpen = isPluginOpen(plugin.id);
				const isDragPlugin = dragPluginId === plugin.id;

				const catNodes: React.ReactNode[] = [];
				plugin.categories.forEach((cat, idx) => {
					if (isDragPlugin && dropSlot === idx) {
						catNodes.push(
							<CatPlaceholder key="placeholder">
								{dragIdx !== null ? translateCategoryName(plugin.categories[dragIdx].name) : null}
							</CatPlaceholder>
						);
					}
					catNodes.push(
						<CatItem
							key={`cat-${idx}`}
							ref={(el) => setCatRef(plugin.id, idx, el)}
							$active={active === categorySection(plugin.id, idx)}
							$dragging={isDragPlugin && idx === dragIdx}
							onMouseDown={(e) => handleCatMouseDown(e, plugin.id, idx, plugin.categories.length)}
						>
							<CatGrip>&#x2807;</CatGrip>
							<CatName>{translateCategoryName(cat.name)}</CatName>
							<CatCount>{cat.chars.length}</CatCount>
							<CatDeleteBtn
								onClick={(e) => {
									e.stopPropagation();
									onDeleteCategory(plugin.id, idx);
								}}
								title={t('delete_category') as string}
							>
								&times;
							</CatDeleteBtn>
						</CatItem>
					);
				});
				if (isDragPlugin && dropSlot === plugin.categories.length) {
					catNodes.push(
						<CatPlaceholder key="placeholder">
							{dragIdx !== null ? translateCategoryName(plugin.categories[dragIdx].name) : null}
						</CatPlaceholder>
					);
				}

				return (
					<div key={plugin.id}>
						<Divider />
						<PluginGroupHeader>
							<GroupChevron $open={pluginIsOpen} onClick={() => togglePluginOpen(plugin.id)}>
								&#x25B6;
							</GroupChevron>
							<PluginGroupName onClick={() => togglePluginOpen(plugin.id)}>{plugin.name}</PluginGroupName>
							<PluginGroupRight>
								<PluginToggle
									type="checkbox"
									checked={enabled}
									onChange={(e) => onTogglePlugin(plugin.id, e.target.checked)}
									title={enabled ? (t('plugin_enabled') as string) : (t('plugin_disabled') as string)}
								/>
							</PluginGroupRight>
						</PluginGroupHeader>
						<Collapsible $open={pluginIsOpen}>
							<div>
								<GroupItems>
									<ShortcutsItem
										$active={active === shortcutsSection(plugin.id)}
										onClick={() => onSelect(shortcutsSection(plugin.id))}
									>
										<ShortcutsIcon>&#x26A1;</ShortcutsIcon>
										<CatName>{t('section_shortcuts')}</CatName>
										<CatCount>{plugin.shortcuts.length}</CatCount>
									</ShortcutsItem>
								</GroupItems>
								{plugin.categories.length > 0 && <CatSubLabel>{t('tab_categories')}</CatSubLabel>}
								<GroupItems>{catNodes}</GroupItems>
								<AddBtn onClick={() => onAddCategory(plugin.id)}>{t('add_category')}</AddBtn>
							</div>
						</Collapsible>
					</div>
				);
			})}

			<Divider />
			<GroupHeader onClick={() => setAppsOpen(!appsOpen)}>
				<GroupChevron $open={appsOpen}>&#x25B6;</GroupChevron>
				{t('section_apps')}
			</GroupHeader>
			<Collapsible $open={appsOpen}>
				<div>
					<GroupItems>
						{stopList.length === 0 && <EmptyApps>{t('stoplist_empty')}</EmptyApps>}
						{stopList.map((entry, idx) => (
							<AppItem key={entry.exe} $active={entry.exe === active} onClick={() => onSelect(entry.exe)}>
								<span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{entry.exe}
								</span>
								<AppDeleteBtn
									onClick={(e) => {
										e.stopPropagation();
										handleDeleteApp(idx);
									}}
								>
									&times;
								</AppDeleteBtn>
							</AppItem>
						))}
					</GroupItems>
				</div>
			</Collapsible>

			<DropdownWrap ref={dropRef}>
				<AddBtn
					ref={addBtnRef}
					onClick={() => {
						if (!open && addBtnRef.current) {
							const r = addBtnRef.current.getBoundingClientRect();
							const W = Math.min(340, window.innerWidth - 20);
							const H = Math.min(260, window.innerHeight - 20);
							const left = Math.max(10, Math.min(r.left, window.innerWidth - W - 10));
							const bottom = Math.min(window.innerHeight - r.top + 4, window.innerHeight - H - 10);
							setDropPos({ left, bottom: Math.max(10, bottom) });
						}
						setOpen(!open);
					}}
				>
					+ {t('stoplist_add_app')}
				</AddBtn>
				{open && dropPos && (
					<Dropdown style={{ left: dropPos.left, bottom: dropPos.bottom }}>
						<SearchInput
							ref={searchRef}
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setHlIdx(-1);
							}}
							onKeyDown={handleSearchKeyDown}
							placeholder={t('stoplist_search_placeholder') as string}
						/>
						<DropAppList>
							{filtered.length === 0 && <NoApps>{t('stoplist_no_apps')}</NoApps>}
							{filtered.map((app, i) => {
								const added = alreadyAdded.has(app.exe.toLowerCase());
								return (
									<DropAppRow
										key={app.exe}
										$disabled={added}
										$highlighted={i === hlIdx}
										onClick={() => !added && handleAddApp(app.exe)}
										onMouseEnter={() => !added && setHlIdx(i)}
									>
										<DropAppExe>{app.exe}</DropAppExe>
										<DropAppTitle>{app.title}</DropAppTitle>
									</DropAppRow>
								);
							})}
						</DropAppList>
					</Dropdown>
				)}
			</DropdownWrap>

			<BottomSpacer />

			{dragPluginId !== null && dragIdx !== null && ghostPos && (
				<DragGhost style={{ left: ghostPos.x + 12, top: ghostPos.y - 16 }}>
					{(() => {
						const p = plugins.find((pl) => pl.id === dragPluginId);
						return p ? translateCategoryName(p.categories[dragIdx]?.name ?? '') : '';
					})()}
				</DragGhost>
			)}
		</SidebarRoot>
	);
};

export default SettingsSidebar;
