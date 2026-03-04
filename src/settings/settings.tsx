import { useState, useEffect } from 'react';
import Root, {
	SettingsGlobalStyle,
	GlassOverrides,
	Header,
	HeaderRight,
	Body,
	Main,
	Empty,
	SegmentedWrapper,
	SegmentedControl,
	Segment,
	BtnPrimary,
	BtnSecondary,
	SettingsGroup,
	SettingsRow,
	SettingsRowLabel,
	Footer,
	Copyright
} from './settings.styles';
import {
	loadCategories, saveCategories, resetCategories, DEFAULT_CATEGORIES,
	loadShortcuts, saveShortcuts, resetShortcuts, DEFAULT_SHORTCUTS,
	loadStopList, saveStopList
} from '../store';
import { emitEvent } from '../events';
import { invoke } from '@tauri-apps/api/core';
import CategoryList from '../components/category-list';
import CategoryEditor from '../components/category-editor';
import PresetPicker from '../components/preset-picker';
import ThemePicker from '../components/theme-picker';
import LanguagePicker from '../components/language-picker';
import AutostartToggle from '../components/autostart-toggle';
import ExpansionToggle from '../components/expansion-toggle';
import HintsPositionPicker from '../components/hints-position';
import ShortcutEditor from '../components/shortcut-editor';
import StopListEditor from '../components/stoplist-editor';
import BottomBar, { openUrl } from '../components/bottom-bar';
import { useLanguage } from '../i18n';
import type { Category, CharEntry, Shortcut, StopListEntry } from '../types';

const Settings = () => {
	const t = useLanguage();
	const [tab, setTab] = useState<'categories' | 'shortcuts' | 'appearance' | 'system'>('categories');
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedIdx, setSelectedIdx] = useState(0);
	const [showPresets, setShowPresets] = useState(false);
	const [dirty, setDirty] = useState(false);
	const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
	const [shortcutsDirty, setShortcutsDirty] = useState(false);
	const [stopList, setStopList] = useState<StopListEntry[]>([]);
	const [stopListDirty, setStopListDirty] = useState(false);

	useEffect(() => {
		loadCategories().then(setCategories);
		loadShortcuts().then(setShortcuts);
		loadStopList().then(setStopList);

		// Listen for request to switch to shortcuts tab (from main window)
		let unlisten: (() => void) | undefined;
		import('@tauri-apps/api/event')
			.then(({ listen }) => listen('open-shortcuts-tab', () => setTab('shortcuts')))
			.then((fn) => { unlisten = fn; })
			.catch(() => {});
		return () => { unlisten?.(); };
	}, []);

	const selected = categories[selectedIdx] || null;

	const update = (newCats: Category[]) => {
		setCategories(newCats);
		setDirty(true);
	};

	const handleSave = async () => {
		await saveCategories(categories);
		setDirty(false);
		await emitEvent('categories-changed');
	};

	const handleReset = async () => {
		await resetCategories();
		setCategories(DEFAULT_CATEGORIES);
		setSelectedIdx(0);
		setDirty(false);
		await emitEvent('categories-changed');
	};

	const handleAddCategory = () => {
		const newCat: Category = { name: 'New Category', chars: [] };
		const newCats = [...categories, newCat];
		update(newCats);
		setSelectedIdx(newCats.length - 1);
	};

	const handleDeleteCategory = (idx: number) => {
		const newCats = categories.filter((_, i) => i !== idx);
		update(newCats);
		if (selectedIdx >= newCats.length) {
			setSelectedIdx(Math.max(0, newCats.length - 1));
		}
	};

	const handleReorderCategory = (fromIdx: number, toIdx: number) => {
		const newCats = [...categories];
		const [moved] = newCats.splice(fromIdx, 1);
		newCats.splice(toIdx, 0, moved);
		update(newCats);
		// Follow the moved category if it was selected
		if (selectedIdx === fromIdx) {
			setSelectedIdx(toIdx);
		} else if (selectedIdx > fromIdx && selectedIdx <= toIdx) {
			setSelectedIdx(selectedIdx - 1);
		} else if (selectedIdx < fromIdx && selectedIdx >= toIdx) {
			setSelectedIdx(selectedIdx + 1);
		}
	};

	const handleUpdateCategory = (idx: number, updatedCat: Category) => {
		const newCats = categories.map((c, i) => (i === idx ? updatedCat : c));
		update(newCats);
	};

	const handleSaveShortcuts = async () => {
		await saveShortcuts(shortcuts);
		await saveStopList(stopList);
		setShortcutsDirty(false);
		setStopListDirty(false);
		await invoke('expansion_update_shortcuts', { shortcuts });
		await invoke('expansion_update_stoplist', { entries: stopList });
		await emitEvent('shortcuts-changed');
	};

	const handleResetShortcuts = async () => {
		await resetShortcuts();
		setShortcuts(DEFAULT_SHORTCUTS);
		setShortcutsDirty(false);
		setStopList([]);
		setStopListDirty(false);
		await saveStopList([]);
		await invoke('expansion_update_shortcuts', { shortcuts: DEFAULT_SHORTCUTS });
		await invoke('expansion_update_stoplist', { entries: [] as StopListEntry[] });
		await emitEvent('shortcuts-changed');
	};

	const handleAddFromPresets = (chars: CharEntry[]) => {
		if (!selected) return;
		const existing = new Set(selected.chars.map(([ch]) => ch));
		const newChars = chars.filter(([ch]) => !existing.has(ch));
		if (newChars.length === 0) return;
		handleUpdateCategory(selectedIdx, {
			...selected,
			chars: [...selected.chars, ...newChars]
		});
		setShowPresets(false);
	};

	return (
		<>
			<SettingsGlobalStyle />
			<GlassOverrides />
			<Root>
				<Header data-tauri-drag-region>
					<h1>{t('settings_title')}</h1>
					<HeaderRight style={tab !== 'categories' && tab !== 'shortcuts' ? { visibility: 'hidden' } : undefined}>
						<BtnSecondary onClick={tab === 'shortcuts' ? handleResetShortcuts : handleReset}>
							{t('reset_to_default')}
						</BtnSecondary>
						<BtnPrimary
							onClick={tab === 'shortcuts' ? handleSaveShortcuts : handleSave}
							disabled={tab === 'shortcuts' ? !(shortcutsDirty || stopListDirty) : !dirty}
						>
							{(tab === 'shortcuts' ? (shortcutsDirty || stopListDirty) : dirty) ? t('save_changes') : t('saved')}
						</BtnPrimary>
					</HeaderRight>
				</Header>

				<SegmentedWrapper>
					<SegmentedControl>
						<Segment $active={tab === 'categories'} onClick={() => setTab('categories')}>
							{t('tab_categories')}
						</Segment>
						<Segment $active={tab === 'shortcuts'} onClick={() => setTab('shortcuts')}>
							{t('tab_shortcuts')}
						</Segment>
						<Segment $active={tab === 'appearance'} onClick={() => setTab('appearance')}>
							{t('tab_appearance')}
						</Segment>
						<Segment $active={tab === 'system'} onClick={() => setTab('system')}>
							{t('tab_system')}
						</Segment>
					</SegmentedControl>
				</SegmentedWrapper>

				{tab === 'categories' && (
					<Body>
						<CategoryList
							categories={categories}
							selectedIdx={selectedIdx}
							onSelect={setSelectedIdx}
							onDelete={handleDeleteCategory}
							onAdd={handleAddCategory}
							onReorder={handleReorderCategory}
						/>

						<Main>
							{selected ? (
								<CategoryEditor
									category={selected}
									onChange={(cat) => handleUpdateCategory(selectedIdx, cat)}
									onOpenPresets={() => setShowPresets(true)}
								/>
							) : (
								<Empty>{t('no_category_selected')}</Empty>
							)}
						</Main>
					</Body>
				)}

				{tab === 'shortcuts' && (
					<Body>
						<Main>
							<SettingsGroup>
								<SettingsRow>
									<SettingsRowLabel>{t('expansion_enabled_label')}</SettingsRowLabel>
									<ExpansionToggle />
								</SettingsRow>
								<SettingsRow>
									<SettingsRowLabel>{t('hints_position_label')}</SettingsRowLabel>
									<HintsPositionPicker />
								</SettingsRow>
							</SettingsGroup>
							<ShortcutEditor
								shortcuts={shortcuts}
								onChange={(s) => {
									setShortcuts(s);
									setShortcutsDirty(true);
								}}
							/>
							<StopListEditor
								entries={stopList}
								onChange={(e) => {
									setStopList(e);
									setStopListDirty(true);
								}}
							/>
						</Main>
					</Body>
				)}

				{tab === 'appearance' && (
					<Body>
						<Main>
							<SettingsGroup>
								<ThemePicker />
							</SettingsGroup>
						</Main>
					</Body>
				)}

				{tab === 'system' && (
					<Body>
						<Main>
							<SettingsGroup>
								<SettingsRow>
									<SettingsRowLabel>{t('language_label')}</SettingsRowLabel>
									<LanguagePicker />
								</SettingsRow>
								<SettingsRow>
									<SettingsRowLabel>{t('autostart_label')}</SettingsRowLabel>
									<AutostartToggle />
								</SettingsRow>
							</SettingsGroup>
						</Main>
					</Body>
				)}

				<Footer>
					<BottomBar
						right={
							<Copyright onClick={() => openUrl('https://github.com/keireira')}>
								&copy; Alena Dzhukich (2026)
								<svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
									<path d="M3.5 3a.5.5 0 0 0 0 1h3.793L2.146 9.146a.5.5 0 1 0 .708.708L8 4.707V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5z" />
								</svg>
							</Copyright>
						}
					/>
				</Footer>

				{showPresets && selected && (
					<PresetPicker
						onAdd={handleAddFromPresets}
						onClose={() => setShowPresets(false)}
						existingChars={selected.chars.map(([ch]) => ch)}
					/>
				)}
			</Root>
		</>
	);
};

export default Settings;
