import { useState, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useLanguage, translateCategoryName } from '../../i18n';
import type { Category, StopListEntry } from '../../types';
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
	BottomSpacer
} from './settings-sidebar.styles';

type RunningApp = { exe: string; title: string };

const DEFAULT_ENTRY: Omit<StopListEntry, 'exe'> = {
	expansion: true,
	hints: true,
	direction: 'auto',
	offset: { top: 0, bottom: 0, left: 0, right: 0 }
};

export type ActiveSection = string;
// Values: 'shortcuts' | 'settings' | `cat:${number}` | app exe name

export const isCategorySection = (s: string) => s.startsWith('cat:');
export const categoryIdx = (s: string) => parseInt(s.slice(4), 10);
export const categorySection = (idx: number) => `cat:${idx}`;

type Props = {
	active: ActiveSection;
	onSelect: (section: ActiveSection) => void;
	// Categories
	categories: Category[];
	onAddCategory: () => void;
	onDeleteCategory: (idx: number) => void;
	onReorderCategory: (from: number, to: number) => void;
	// Apps
	stopList: StopListEntry[];
	onStopListChange: (entries: StopListEntry[]) => void;
};

const SettingsSidebar = ({
	active,
	onSelect,
	categories,
	onAddCategory,
	onDeleteCategory,
	onReorderCategory,
	stopList,
	onStopListChange
}: Props) => {
	const t = useLanguage();

	/* ---- Collapsible groups ---- */
	const [catsOpen, setCatsOpen] = useState(true);
	const [appsOpen, setAppsOpen] = useState(true);

	/* ---- Category drag-drop ---- */
	const [dragIdx, setDragIdx] = useState<number | null>(null);
	const [dropSlot, setDropSlot] = useState<number | null>(null);
	const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
	const catRefs = useRef<Map<number, HTMLDivElement>>(new Map());
	const dragging = useRef(false);

	const setCatRef = useCallback((idx: number, el: HTMLDivElement | null) => {
		if (el) catRefs.current.set(idx, el);
		else catRefs.current.delete(idx);
	}, []);

	const computeSlot = useCallback(
		(clientY: number, currentDragIdx: number): number | null => {
			let slot = categories.length;
			for (let i = 0; i < categories.length; i++) {
				const el = catRefs.current.get(i);
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
		[categories.length]
	);

	const handleCatMouseDown = useCallback(
		(e: React.MouseEvent, idx: number) => {
			if ((e.target as HTMLElement).closest('button')) return;
			e.preventDefault();
			const startY = e.clientY;
			let started = false;

			const onMouseMove = (ev: MouseEvent) => {
				if (!started) {
					if (Math.abs(ev.clientY - startY) < 4) return;
					started = true;
					dragging.current = true;
					setDragIdx(idx);
				}
				setDropSlot(computeSlot(ev.clientY, idx));
				setGhostPos({ x: ev.clientX, y: ev.clientY });
			};

			const onMouseUp = () => {
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);

				if (!started) {
					onSelect(categorySection(idx));
					return;
				}
				dragging.current = false;

				setDropSlot((currentSlot) => {
					if (currentSlot !== null) {
						let toIdx = currentSlot;
						if (idx < toIdx) toIdx--;
						if (toIdx !== idx) {
							setTimeout(() => onReorderCategory(idx, toIdx), 0);
						}
					}
					return null;
				});
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

	// selectable (non-disabled) indices
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
				onSelect('shortcuts');
			} else {
				const newIdx = Math.min(idx, next.length - 1);
				onSelect(next[newIdx].exe);
			}
		}
		onStopListChange(next);
	};

	/* ---- Build category nodes with drag placeholders ---- */
	const catNodes: React.ReactNode[] = [];
	categories.forEach((cat, idx) => {
		if (dropSlot === idx) {
			catNodes.push(
				<CatPlaceholder key="placeholder">
					{dragIdx !== null ? translateCategoryName(categories[dragIdx].name) : null}
				</CatPlaceholder>
			);
		}
		catNodes.push(
			<CatItem
				key={`cat-${idx}`}
				ref={(el) => setCatRef(idx, el)}
				$active={active === categorySection(idx)}
				$dragging={idx === dragIdx}
				onMouseDown={(e) => handleCatMouseDown(e, idx)}
			>
				<CatGrip>&#x2807;</CatGrip>
				<CatName>{translateCategoryName(cat.name)}</CatName>
				<CatCount>{cat.chars.length}</CatCount>
				<CatDeleteBtn
					onClick={(e) => {
						e.stopPropagation();
						onDeleteCategory(idx);
					}}
					title={t('delete_category') as string}
				>
					&times;
				</CatDeleteBtn>
			</CatItem>
		);
	});
	if (dropSlot === categories.length) {
		catNodes.push(
			<CatPlaceholder key="placeholder">
				{dragIdx !== null ? translateCategoryName(categories[dragIdx].name) : null}
			</CatPlaceholder>
		);
	}

	return (
		<SidebarRoot>
			<SectionItems>
				<SectionItem $active={active === 'shortcuts'} onClick={() => onSelect('shortcuts')}>
					<SectionLabel>{t('section_shortcuts')}</SectionLabel>
				</SectionItem>
				<SectionItem $active={active === 'settings'} onClick={() => onSelect('settings')}>
					<SectionLabel>{t('section_settings')}</SectionLabel>
				</SectionItem>
			</SectionItems>

			<Divider />
			<GroupHeader onClick={() => setCatsOpen(!catsOpen)}>
				<GroupChevron $open={catsOpen}>&#x25B6;</GroupChevron>
				{t('tab_categories')}
			</GroupHeader>
			<Collapsible $open={catsOpen}>
				<div>
					<GroupItems>{catNodes}</GroupItems>
					<AddBtn onClick={onAddCategory}>{t('add_category')}</AddBtn>
				</div>
			</Collapsible>

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

			{dragIdx !== null && ghostPos && (
				<DragGhost style={{ left: ghostPos.x + 12, top: ghostPos.y - 16 }}>
					{translateCategoryName(categories[dragIdx].name)}
				</DragGhost>
			)}
		</SidebarRoot>
	);
};

export default SettingsSidebar;
