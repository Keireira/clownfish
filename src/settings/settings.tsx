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
	SettingsRowLabel
} from './settings.styles';
import { loadCategories, saveCategories, resetCategories, DEFAULT_CATEGORIES } from '../store';
import CategoryList from '../components/category-list';
import CategoryEditor from '../components/category-editor';
import PresetPicker from '../components/preset-picker';
import ThemePicker from '../components/theme-picker';
import LanguagePicker from '../components/language-picker';
import AutostartToggle from '../components/autostart-toggle';
import { useLanguage } from '../i18n';
import type { Category, CharEntry } from '../types';

const Settings = () => {
	const t = useLanguage();
	const [tab, setTab] = useState<'categories' | 'appearance'>('categories');
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedIdx, setSelectedIdx] = useState(0);
	const [showPresets, setShowPresets] = useState(false);
	const [dirty, setDirty] = useState(false);

	useEffect(() => {
		loadCategories().then((cats) => {
			setCategories(cats);
		});
	}, []);

	const selected = categories[selectedIdx] || null;

	const update = (newCats: Category[]) => {
		setCategories(newCats);
		setDirty(true);
	};

	const handleSave = async () => {
		await saveCategories(categories);
		setDirty(false);
		try {
			const { emit } = await import('@tauri-apps/api/event');
			await emit('categories-changed');
		} catch (err) {
			console.error(err);
		}
	};

	const handleReset = async () => {
		await resetCategories();
		setCategories(DEFAULT_CATEGORIES);
		setSelectedIdx(0);
		setDirty(false);
		try {
			const { emit } = await import('@tauri-apps/api/event');
			await emit('categories-changed');
		} catch (err) {
			console.error(err);
		}
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
					<HeaderRight style={tab !== 'categories' ? { visibility: 'hidden' } : undefined}>
						<BtnSecondary onClick={handleReset}>{t('reset_to_default')}</BtnSecondary>
						<BtnPrimary onClick={handleSave} disabled={!dirty}>
							{dirty ? t('save_changes') : t('saved')}
						</BtnPrimary>
					</HeaderRight>
				</Header>

				<SegmentedWrapper>
					<SegmentedControl>
						<Segment $active={tab === 'categories'} onClick={() => setTab('categories')}>
							{t('tab_categories')}
						</Segment>
						<Segment $active={tab === 'appearance'} onClick={() => setTab('appearance')}>
							{t('tab_appearance')}
						</Segment>
					</SegmentedControl>
				</SegmentedWrapper>

				{tab === 'categories' ? (
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
				) : (
					<Body>
						<Main>
							<SettingsGroup>
								<ThemePicker />
							</SettingsGroup>
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
