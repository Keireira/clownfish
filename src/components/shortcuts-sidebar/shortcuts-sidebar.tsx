import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useLanguage } from '../../i18n';
import type { StopListEntry } from '../../types';
import SidebarRoot, {
	SectionItems,
	SectionItem,
	SectionLabel,
	Divider,
	GroupHeader,
	AppItems,
	AppItem,
	AppDeleteBtn,
	EmptyApps,
	AddBtn,
	DropdownWrap,
	Dropdown,
	SearchInput,
	AppList,
	AppRow,
	AppExe,
	AppTitle,
	NoApps
} from './shortcuts-sidebar.styles';

type RunningApp = { exe: string; title: string };

const DEFAULT_ENTRY: Omit<StopListEntry, 'exe'> = {
	expansion: true,
	hints: true,
	direction: 'auto',
	offset: { top: 0, bottom: 0, left: 0, right: 0 }
};

type Props = {
	activeItem: string;
	onSelect: (item: string) => void;
	entries: StopListEntry[];
	onEntriesChange: (entries: StopListEntry[]) => void;
};

const ShortcutsSidebar = ({ activeItem, onSelect, entries, onEntriesChange }: Props) => {
	const t = useLanguage();
	const [open, setOpen] = useState(false);
	const [apps, setApps] = useState<RunningApp[]>([]);
	const [search, setSearch] = useState('');
	const dropRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	// Fetch running apps when dropdown opens
	useEffect(() => {
		if (!open) return;
		invoke<RunningApp[]>('expansion_list_running_apps')
			.then(setApps)
			.catch(() => setApps([]));
	}, [open]);

	// Focus search on open
	useEffect(() => {
		if (open) searchRef.current?.focus();
	}, [open]);

	// Close on outside click
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

	const alreadyAdded = new Set(entries.map((e) => e.exe.toLowerCase()));

	const filtered = apps.filter((a) => {
		const q = search.toLowerCase();
		return a.exe.includes(q) || a.title.toLowerCase().includes(q);
	});

	const handleAdd = (exe: string) => {
		if (alreadyAdded.has(exe.toLowerCase())) return;
		const lower = exe.toLowerCase();
		onEntriesChange([...entries, { exe: lower, ...DEFAULT_ENTRY }]);
		onSelect(lower);
		setOpen(false);
		setSearch('');
	};

	const handleDelete = (idx: number) => {
		const deleted = entries[idx];
		const next = [...entries];
		next.splice(idx, 1);

		// Auto-select adjacent or fall back
		if (deleted.exe === activeItem) {
			if (next.length === 0) {
				onSelect('settings');
			} else {
				const newIdx = Math.min(idx, next.length - 1);
				onSelect(next[newIdx].exe);
			}
		}
		onEntriesChange(next);
	};

	return (
		<SidebarRoot>
			<SectionItems>
				<SectionItem $active={activeItem === 'shortcuts'} onClick={() => onSelect('shortcuts')}>
					<SectionLabel>{t('section_shortcuts')}</SectionLabel>
				</SectionItem>
				<SectionItem $active={activeItem === 'settings'} onClick={() => onSelect('settings')}>
					<SectionLabel>{t('section_settings')}</SectionLabel>
				</SectionItem>
			</SectionItems>

			<Divider />
			<GroupHeader>{t('section_apps')}</GroupHeader>

			<AppItems>
				{entries.length === 0 && <EmptyApps>{t('stoplist_empty')}</EmptyApps>}
				{entries.map((entry, idx) => (
					<AppItem key={entry.exe} $active={entry.exe === activeItem} onClick={() => onSelect(entry.exe)}>
						<span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{entry.exe}
						</span>
						<AppDeleteBtn
							onClick={(e) => {
								e.stopPropagation();
								handleDelete(idx);
							}}
						>
							&times;
						</AppDeleteBtn>
					</AppItem>
				))}
			</AppItems>

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
		</SidebarRoot>
	);
};

export default ShortcutsSidebar;
