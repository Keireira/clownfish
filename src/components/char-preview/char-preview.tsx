import Root, { Name } from './char-preview.styles';
import { useCharPreview } from './char-preview-context';
import CharInspector from '../char-inspector';

interface CharPreviewProps {
	onCopy?: (message: string) => void;
}

const CharPreview = ({ onCopy }: CharPreviewProps) => {
	const { preview, inspectorTarget } = useCharPreview();

	if (inspectorTarget && onCopy) {
		return (
			<CharInspector
				char={inspectorTarget.char}
				name={inspectorTarget.name}
				onCopy={onCopy}
			/>
		);
	}

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
