import type { Plugin } from '../types';

export const PACKS: Plugin[] = [
	{
		id: 'pack-music',
		name: 'Music Notation',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Music Notation',
				chars: [
					['♩', 'Quarter Note'],
					['♪', 'Eighth Note'],
					['♫', 'Beamed Eighth Notes'],
					['♬', 'Beamed Sixteenth Notes'],
					['♭', 'Flat'],
					['♮', 'Natural'],
					['♯', 'Sharp'],
					['𝄞', 'Treble Clef'],
					['𝄡', 'C Clef']
				]
			}
		],
		shortcuts: []
	},
	{
		id: 'pack-chemistry',
		name: 'Chemistry',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Chemistry',
				chars: [
					['⇌', 'Equilibrium'],
					['⇋', 'Reverse Equilibrium'],
					['→', 'Right Arrow'],
					['←', 'Left Arrow'],
					['↔', 'Left Right Arrow'],
					['△', 'Triangle / Heat'],
					['°', 'Degree'],
					['·', 'Middle Dot'],
					['⁰', 'Superscript Zero'],
					['¹', 'Superscript One'],
					['²', 'Superscript Two'],
					['³', 'Superscript Three'],
					['⁴', 'Superscript Four'],
					['⁵', 'Superscript Five'],
					['⁶', 'Superscript Six'],
					['⁷', 'Superscript Seven'],
					['⁸', 'Superscript Eight'],
					['⁹', 'Superscript Nine']
				]
			}
		],
		shortcuts: []
	},
	{
		id: 'pack-programming',
		name: 'Programming',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Programming',
				chars: [
					['⌘', 'Command'],
					['⌥', 'Option'],
					['⇧', 'Shift'],
					['⌃', 'Control'],
					['⏎', 'Return'],
					['⌫', 'Delete'],
					['⇥', 'Tab'],
					['→', 'Arrow Right'],
					['≠', 'Not Equal'],
					['≈', 'Approximately Equal'],
					['λ', 'Lambda'],
					['∧', 'Logical And'],
					['∨', 'Logical Or'],
					['¬', 'Not']
				]
			}
		],
		shortcuts: []
	},
	{
		id: 'pack-chess',
		name: 'Chess',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Chess',
				chars: [
					['♔', 'White King'],
					['♕', 'White Queen'],
					['♖', 'White Rook'],
					['♗', 'White Bishop'],
					['♘', 'White Knight'],
					['♙', 'White Pawn'],
					['♚', 'Black King'],
					['♛', 'Black Queen'],
					['♜', 'Black Rook'],
					['♝', 'Black Bishop'],
					['♞', 'Black Knight'],
					['♟', 'Black Pawn']
				]
			}
		],
		shortcuts: []
	},
	{
		id: 'pack-phonetics',
		name: 'Phonetics (IPA)',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Phonetics (IPA)',
				chars: [
					['ə', 'Schwa'],
					['ɛ', 'Open-mid Front Unrounded'],
					['ɪ', 'Near-close Front Unrounded'],
					['ʊ', 'Near-close Back Rounded'],
					['ʃ', 'Voiceless Postalveolar Fricative'],
					['ʒ', 'Voiced Postalveolar Fricative'],
					['θ', 'Voiceless Dental Fricative'],
					['ð', 'Voiced Dental Fricative'],
					['ŋ', 'Velar Nasal'],
					['ɒ', 'Open Back Rounded'],
					['ɔ', 'Open-mid Back Rounded'],
					['ʌ', 'Open-mid Back Unrounded']
				]
			}
		],
		shortcuts: []
	},
	{
		id: 'pack-astronomy',
		name: 'Astronomy',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Astronomy',
				chars: [
					['☉', 'Sun'],
					['☽', 'Moon'],
					['☿', 'Mercury'],
					['♀', 'Venus'],
					['♁', 'Earth'],
					['♂', 'Mars'],
					['♃', 'Jupiter'],
					['♄', 'Saturn'],
					['♅', 'Uranus'],
					['♆', 'Neptune']
				]
			}
		],
		shortcuts: []
	},
	{
		id: 'pack-cards-dice',
		name: 'Card Suits & Dice',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Card Suits & Dice',
				chars: [
					['♠', 'Spade'],
					['♣', 'Club'],
					['♥', 'Heart'],
					['♦', 'Diamond'],
					['⚀', 'Die Face 1'],
					['⚁', 'Die Face 2'],
					['⚂', 'Die Face 3'],
					['⚃', 'Die Face 4'],
					['⚄', 'Die Face 5'],
					['⚅', 'Die Face 6']
				]
			}
		],
		shortcuts: []
	},
	{
		id: 'pack-braille',
		name: 'Braille',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Braille',
				chars: [
					['⠁', 'Braille A'],
					['⠂', 'Braille B'],
					['⠃', 'Braille C'],
					['⠄', 'Braille D'],
					['⠅', 'Braille E'],
					['⠆', 'Braille F'],
					['⠇', 'Braille G'],
					['⠈', 'Braille H'],
					['⠉', 'Braille I'],
					['⠊', 'Braille J']
				]
			}
		],
		shortcuts: []
	}
];
