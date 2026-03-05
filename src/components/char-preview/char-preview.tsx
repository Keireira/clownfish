import Root, { Name, Hint } from './char-preview.styles';
import { useCharPreview } from './char-preview-context';
import { t } from '../../i18n';

const CharPreview = () => {
	const { preview } = useCharPreview();
	if (!preview) return null;

	const x = preview.rect.left + preview.rect.width / 2;
	const y = preview.rect.top - 6;

	return (
		<Root $x={x} $y={y}>
			<Name>{preview.name}</Name>
			{!preview.hasShortcut && <Hint>{t('right_click_shortcut')}</Hint>}
		</Root>
	);
};

export default CharPreview;
