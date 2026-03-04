import Root, { Name } from './char-preview.styles';
import { useCharPreview } from './char-preview-context';

const CharPreview = () => {
	const { preview } = useCharPreview();
	if (!preview) return null;

	const x = preview.rect.left + preview.rect.width / 2;
	const y = preview.rect.top - 6;

	return (
		<Root $x={x} $y={y}>
			<Name>{preview.name}</Name>
		</Root>
	);
};

export default CharPreview;
