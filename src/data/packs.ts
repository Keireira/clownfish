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
		id: 'kaomoji',
		name: 'Kaomoji',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Happy',
				chars: [
					['(◕‿◕)', 'Smile'],
					['╰(*°▽°*)╯', 'Excited'],
					['(≧▽≦)', 'Joy'],
					['(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧', 'Sparkle'],
					['(•‿•)', 'Simple Smile'],
					['(◠‿◠)', 'Soft Smile'],
					['ヽ(>∀<☆)ノ', 'Cheering'],
					['(⌒‿⌒)', 'Content'],
					['٩(◕‿◕｡)۶', 'Celebrate']
				]
			},
			{
				name: 'Sad',
				chars: [
					['(╥_╥)', 'Crying'],
					['(T_T)', 'Tears'],
					['(;´д`)', 'Distressed'],
					['(っ˘̩╭╮˘̩)っ', 'Comfort'],
					['(ノ_<。)', 'Sobbing'],
					['(´;ω;`)', 'Weeping'],
					['(｡•́︿•̀｡)', 'Pouting'],
					['(⌯˃̶᷄ ﹏ ˂̶᷄⌯)', 'Heartbroken']
				]
			},
			{
				name: 'Angry',
				chars: [
					['(╯°□°)╯︵ ┻━┻', 'Table Flip'],
					['┬─┬ノ( º _ ºノ)', 'Table Unflip'],
					['(ﾉಥ益ಥ)ﾉ', 'Rage'],
					['(凸ಠ益ಠ)凸', 'Furious'],
					['щ(ﾟДﾟщ)', 'Why'],
					['(ノ°Д°）ノ︵ ┻━┻', 'Angry Flip'],
					['(⊙_⊙)', 'Stunned']
				]
			},
			{
				name: 'Love',
				chars: [
					['(♥‿♥)', 'Heart Eyes'],
					['(づ｡◕‿‿◕｡)づ', 'Hug'],
					['(◕‿◕)♡', 'Love Smile'],
					['♡(ŐωŐ人)', 'Adore'],
					['(灬♥ω♥灬)', 'Lovestruck'],
					['(✿ ♥‿♥)', 'Flower Love'],
					['(♡μ_μ)', 'Shy Love'],
					['(*♡∀♡)', 'Smitten']
				]
			},
			{
				name: 'Surprise',
				chars: [
					['(⊙_⊙)', 'Shocked'],
					['Σ(°△°|||)', 'Alarmed'],
					['(°ロ°)', 'Gasp'],
					['w(°o°)w', 'Wow'],
					['(O_O)', 'Wide Eyes'],
					['(゜▽゜;)', 'Startled'],
					['Σ(ﾟДﾟ)', 'Surprised']
				]
			},
			{
				name: 'Animals',
				chars: [
					['(=^・^=)', 'Cat'],
					['(=^‥^=)', 'Kitty'],
					['ʕ•ᴥ•ʔ', 'Bear'],
					['(・⊝・)', 'Penguin'],
					['🐧(°□°)', 'Penguin Shock'],
					['(≧◡≦)♡', 'Cute'],
					['ᕕ( ᐛ )ᕗ', 'Happy Walk'],
					['( ͡° ᴥ ͡°)', 'Dog']
				]
			},
			{
				name: 'Actions',
				chars: [
					['¯\\_(ツ)_/¯', 'Shrug'],
					['(☞ﾟヮﾟ)☞', 'Pointing Right'],
					['☜(ﾟヮﾟ☜)', 'Pointing Left'],
					['ᕦ(ò_óˇ)ᕤ', 'Flex'],
					['(つ﹏⊂)', 'Hiding'],
					['⊂(◉‿◉)つ', 'Reaching'],
					['(ง\'̀-\'́)ง', 'Fighting'],
					['(•_•) ( •_•)>⌐■-■ (⌐■_■)', 'Deal With It']
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
	},
	{
		id: 'pack-math',
		name: 'Math & LaTeX',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Greek Lowercase',
				chars: [
					['α', 'Alpha'],
					['β', 'Beta'],
					['γ', 'Gamma'],
					['δ', 'Delta'],
					['ε', 'Epsilon'],
					['ζ', 'Zeta'],
					['η', 'Eta'],
					['θ', 'Theta'],
					['ι', 'Iota'],
					['κ', 'Kappa'],
					['λ', 'Lambda'],
					['μ', 'Mu'],
					['ν', 'Nu'],
					['ξ', 'Xi'],
					['π', 'Pi'],
					['ρ', 'Rho'],
					['σ', 'Sigma'],
					['τ', 'Tau'],
					['υ', 'Upsilon'],
					['φ', 'Phi'],
					['χ', 'Chi'],
					['ψ', 'Psi'],
					['ω', 'Omega'],
					['ϵ', 'Epsilon Variant'],
					['ϑ', 'Theta Variant'],
					['ϕ', 'Phi Variant'],
					['ϱ', 'Rho Variant'],
					['ϖ', 'Pi Variant']
				]
			},
			{
				name: 'Greek Uppercase',
				chars: [
					['Γ', 'Gamma'],
					['Δ', 'Delta'],
					['Θ', 'Theta'],
					['Λ', 'Lambda'],
					['Ξ', 'Xi'],
					['Π', 'Pi'],
					['Σ', 'Sigma'],
					['Υ', 'Upsilon'],
					['Φ', 'Phi'],
					['Ψ', 'Psi'],
					['Ω', 'Omega']
				]
			},
			{
				name: 'Operators',
				chars: [
					['∑', 'Summation'],
					['∏', 'Product'],
					['∐', 'Coproduct'],
					['∫', 'Integral'],
					['∬', 'Double Integral'],
					['∭', 'Triple Integral'],
					['∮', 'Contour Integral'],
					['√', 'Square Root'],
					['∛', 'Cube Root'],
					['∜', 'Fourth Root'],
					['∂', 'Partial Derivative'],
					['∇', 'Nabla / Del'],
					['±', 'Plus-Minus'],
					['∓', 'Minus-Plus'],
					['×', 'Times'],
					['÷', 'Division'],
					['⋅', 'Dot Operator'],
					['∘', 'Ring Operator'],
					['⊕', 'Direct Sum'],
					['⊗', 'Tensor Product'],
					['⊙', 'Circled Dot'],
					['⊘', 'Circled Slash'],
					['†', 'Dagger'],
					['‡', 'Double Dagger'],
					['∗', 'Asterisk Operator'],
					['⋆', 'Star Operator']
				]
			},
			{
				name: 'Set Theory',
				chars: [
					['∈', 'Element Of'],
					['∉', 'Not Element Of'],
					['∋', 'Contains'],
					['∌', 'Does Not Contain'],
					['⊂', 'Subset'],
					['⊃', 'Superset'],
					['⊄', 'Not Subset'],
					['⊅', 'Not Superset'],
					['⊆', 'Subset or Equal'],
					['⊇', 'Superset or Equal'],
					['⊈', 'Not Subset or Equal'],
					['⊉', 'Not Superset or Equal'],
					['∪', 'Union'],
					['∩', 'Intersection'],
					['∖', 'Set Minus'],
					['∅', 'Empty Set'],
					['∁', 'Complement']
				]
			},
			{
				name: 'Relations',
				chars: [
					['≠', 'Not Equal'],
					['≈', 'Approximately Equal'],
					['≅', 'Congruent'],
					['≡', 'Identical / Equivalent'],
					['≢', 'Not Identical'],
					['∼', 'Tilde / Similar'],
					['≃', 'Asymptotically Equal'],
					['≄', 'Not Asymptotically Equal'],
					['≤', 'Less or Equal'],
					['≥', 'Greater or Equal'],
					['≪', 'Much Less Than'],
					['≫', 'Much Greater Than'],
					['≮', 'Not Less Than'],
					['≯', 'Not Greater Than'],
					['≰', 'Not Less or Equal'],
					['≱', 'Not Greater or Equal'],
					['∝', 'Proportional'],
					['≍', 'Equivalent'],
					['≐', 'Approaches the Limit'],
					['∥', 'Parallel'],
					['∦', 'Not Parallel'],
					['⊥', 'Perpendicular'],
					['∤', 'Does Not Divide'],
					['∣', 'Divides']
				]
			},
			{
				name: 'Logic',
				chars: [
					['∀', 'For All'],
					['∃', 'There Exists'],
					['∄', 'Does Not Exist'],
					['∧', 'Logical And'],
					['∨', 'Logical Or'],
					['¬', 'Negation'],
					['⊢', 'Proves / Turnstile'],
					['⊣', 'Left Turnstile'],
					['⊨', 'Models / Entails'],
					['⊤', 'Tautology / Top'],
					['⊥', 'Contradiction / Bottom'],
					['⊩', 'Forces'],
					['⋀', 'N-ary And'],
					['⋁', 'N-ary Or'],
					['⟹', 'Long Implies'],
					['⟺', 'Long Iff'],
					['∴', 'Therefore'],
					['∵', 'Because']
				]
			},
			{
				name: 'Blackboard Bold',
				chars: [
					['ℕ', 'Natural Numbers'],
					['ℤ', 'Integers'],
					['ℚ', 'Rationals'],
					['ℝ', 'Reals'],
					['ℂ', 'Complex Numbers'],
					['ℙ', 'Primes / Probability'],
					['𝔸', 'Algebraic Numbers'],
					['𝔹', 'Ball'],
					['𝔻', 'Unit Disk'],
					['𝔼', 'Expected Value'],
					['𝔽', 'Finite Field'],
					['ℍ', 'Quaternions'],
					['𝕀', 'Indicator'],
					['𝕂', 'Field'],
					['𝕃', 'L'],
					['𝕆', 'Octonions'],
					['𝕊', 'Sphere'],
					['𝕋', 'Torus'],
					['𝕌', 'U'],
					['𝕍', 'Vector Space'],
					['𝕎', 'W'],
					['𝟙', 'Identity / Indicator']
				]
			},
			{
				name: 'Brackets',
				chars: [
					['⟨', 'Left Angle Bracket'],
					['⟩', 'Right Angle Bracket'],
					['⌈', 'Left Ceiling'],
					['⌉', 'Right Ceiling'],
					['⌊', 'Left Floor'],
					['⌋', 'Right Floor'],
					['⟦', 'Left Double Bracket'],
					['⟧', 'Right Double Bracket'],
					['⟮', 'Left Flattened Paren'],
					['⟯', 'Right Flattened Paren'],
					['‖', 'Double Vertical Line']
				]
			},
			{
				name: 'Dots & Misc',
				chars: [
					['⋯', 'Horizontal Ellipsis (centered)'],
					['⋮', 'Vertical Ellipsis'],
					['⋰', 'Up Right Diagonal Ellipsis'],
					['⋱', 'Down Right Diagonal Ellipsis'],
					['∞', 'Infinity'],
					['ℵ', 'Aleph'],
					['ℶ', 'Beth'],
					['ℷ', 'Gimel'],
					['ℏ', 'Planck Constant / H-Bar'],
					['ℓ', 'Script Small L'],
					['℘', 'Weierstrass P'],
					['ℑ', 'Imaginary Part'],
					['ℜ', 'Real Part'],
					['∠', 'Angle'],
					['∡', 'Measured Angle'],
					['△', 'Triangle'],
					['□', 'Square / QED'],
					['◇', 'Diamond'],
					['★', 'Black Star'],
					['♯', 'Sharp / Number']
				]
			}
		],
		shortcuts: [
			{ trigger: '\\\\alpha', expansion: 'α' },
			{ trigger: '\\\\beta', expansion: 'β' },
			{ trigger: '\\\\gamma', expansion: 'γ' },
			{ trigger: '\\\\delta', expansion: 'δ' },
			{ trigger: '\\\\epsilon', expansion: 'ε' },
			{ trigger: '\\\\zeta', expansion: 'ζ' },
			{ trigger: '\\\\eta', expansion: 'η' },
			{ trigger: '\\\\theta', expansion: 'θ' },
			{ trigger: '\\\\iota', expansion: 'ι' },
			{ trigger: '\\\\kappa', expansion: 'κ' },
			{ trigger: '\\\\lambda', expansion: 'λ' },
			{ trigger: '\\\\mu', expansion: 'μ' },
			{ trigger: '\\\\nu', expansion: 'ν' },
			{ trigger: '\\\\xi', expansion: 'ξ' },
			{ trigger: '\\\\pi', expansion: 'π' },
			{ trigger: '\\\\rho', expansion: 'ρ' },
			{ trigger: '\\\\sigma', expansion: 'σ' },
			{ trigger: '\\\\tau', expansion: 'τ' },
			{ trigger: '\\\\upsilon', expansion: 'υ' },
			{ trigger: '\\\\phi', expansion: 'φ' },
			{ trigger: '\\\\chi', expansion: 'χ' },
			{ trigger: '\\\\psi', expansion: 'ψ' },
			{ trigger: '\\\\omega', expansion: 'ω' },
			{ trigger: '\\\\Gamma', expansion: 'Γ' },
			{ trigger: '\\\\Delta', expansion: 'Δ' },
			{ trigger: '\\\\Theta', expansion: 'Θ' },
			{ trigger: '\\\\Lambda', expansion: 'Λ' },
			{ trigger: '\\\\Xi', expansion: 'Ξ' },
			{ trigger: '\\\\Pi', expansion: 'Π' },
			{ trigger: '\\\\Sigma', expansion: 'Σ' },
			{ trigger: '\\\\Phi', expansion: 'Φ' },
			{ trigger: '\\\\Psi', expansion: 'Ψ' },
			{ trigger: '\\\\Omega', expansion: 'Ω' },
			{ trigger: '\\\\sum', expansion: '∑' },
			{ trigger: '\\\\prod', expansion: '∏' },
			{ trigger: '\\\\int', expansion: '∫' },
			{ trigger: '\\\\iint', expansion: '∬' },
			{ trigger: '\\\\iiint', expansion: '∭' },
			{ trigger: '\\\\oint', expansion: '∮' },
			{ trigger: '\\\\sqrt', expansion: '√' },
			{ trigger: '\\\\cbrt', expansion: '∛' },
			{ trigger: '\\\\partial', expansion: '∂' },
			{ trigger: '\\\\nabla', expansion: '∇' },
			{ trigger: '\\\\pm', expansion: '±' },
			{ trigger: '\\\\mp', expansion: '∓' },
			{ trigger: '\\\\times', expansion: '×' },
			{ trigger: '\\\\div', expansion: '÷' },
			{ trigger: '\\\\cdot', expansion: '⋅' },
			{ trigger: '\\\\circ', expansion: '∘' },
			{ trigger: '\\\\oplus', expansion: '⊕' },
			{ trigger: '\\\\otimes', expansion: '⊗' },
			{ trigger: '\\\\odot', expansion: '⊙' },
			{ trigger: '\\\\dagger', expansion: '†' },
			{ trigger: '\\\\ddagger', expansion: '‡' },
			{ trigger: '\\\\in', expansion: '∈' },
			{ trigger: '\\\\notin', expansion: '∉' },
			{ trigger: '\\\\ni', expansion: '∋' },
			{ trigger: '\\\\subset', expansion: '⊂' },
			{ trigger: '\\\\supset', expansion: '⊃' },
			{ trigger: '\\\\subseteq', expansion: '⊆' },
			{ trigger: '\\\\supseteq', expansion: '⊇' },
			{ trigger: '\\\\cup', expansion: '∪' },
			{ trigger: '\\\\cap', expansion: '∩' },
			{ trigger: '\\\\emptyset', expansion: '∅' },
			{ trigger: '\\\\neq', expansion: '≠' },
			{ trigger: '\\\\approx', expansion: '≈' },
			{ trigger: '\\\\cong', expansion: '≅' },
			{ trigger: '\\\\equiv', expansion: '≡' },
			{ trigger: '\\\\sim', expansion: '∼' },
			{ trigger: '\\\\leq', expansion: '≤' },
			{ trigger: '\\\\geq', expansion: '≥' },
			{ trigger: '\\\\ll', expansion: '≪' },
			{ trigger: '\\\\gg', expansion: '≫' },
			{ trigger: '\\\\propto', expansion: '∝' },
			{ trigger: '\\\\perp', expansion: '⊥' },
			{ trigger: '\\\\parallel', expansion: '∥' },
			{ trigger: '\\\\forall', expansion: '∀' },
			{ trigger: '\\\\exists', expansion: '∃' },
			{ trigger: '\\\\nexists', expansion: '∄' },
			{ trigger: '\\\\land', expansion: '∧' },
			{ trigger: '\\\\lor', expansion: '∨' },
			{ trigger: '\\\\neg', expansion: '¬' },
			{ trigger: '\\\\vdash', expansion: '⊢' },
			{ trigger: '\\\\models', expansion: '⊨' },
			{ trigger: '\\\\top', expansion: '⊤' },
			{ trigger: '\\\\bot', expansion: '⊥' },
			{ trigger: '\\\\therefore', expansion: '∴' },
			{ trigger: '\\\\because', expansion: '∵' },
			{ trigger: '\\\\implies', expansion: '⟹' },
			{ trigger: '\\\\iff', expansion: '⟺' },
			{ trigger: '\\\\infty', expansion: '∞' },
			{ trigger: '\\\\aleph', expansion: 'ℵ' },
			{ trigger: '\\\\hbar', expansion: 'ℏ' },
			{ trigger: '\\\\ell', expansion: 'ℓ' },
			{ trigger: '\\\\wp', expansion: '℘' },
			{ trigger: '\\\\Re', expansion: 'ℜ' },
			{ trigger: '\\\\Im', expansion: 'ℑ' },
			{ trigger: '\\\\angle', expansion: '∠' },
			{ trigger: '\\\\langle', expansion: '⟨' },
			{ trigger: '\\\\rangle', expansion: '⟩' },
			{ trigger: '\\\\lceil', expansion: '⌈' },
			{ trigger: '\\\\rceil', expansion: '⌉' },
			{ trigger: '\\\\lfloor', expansion: '⌊' },
			{ trigger: '\\\\rfloor', expansion: '⌋' },
			{ trigger: '\\\\cdots', expansion: '⋯' },
			{ trigger: '\\\\vdots', expansion: '⋮' },
			{ trigger: '\\\\ddots', expansion: '⋱' },
			{ trigger: '\\\\mathbbN', expansion: 'ℕ' },
			{ trigger: '\\\\mathbbZ', expansion: 'ℤ' },
			{ trigger: '\\\\mathbbQ', expansion: 'ℚ' },
			{ trigger: '\\\\mathbbR', expansion: 'ℝ' },
			{ trigger: '\\\\mathbbC', expansion: 'ℂ' },
			{ trigger: '\\\\mathbbP', expansion: 'ℙ' },
			{ trigger: '\\\\QED', expansion: '□' }
		]
	},
	{
		id: 'pack-superscripts',
		name: 'Superscripts & Subscripts',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Superscript Digits',
				chars: [
					['⁰', 'Superscript 0'],
					['¹', 'Superscript 1'],
					['²', 'Superscript 2'],
					['³', 'Superscript 3'],
					['⁴', 'Superscript 4'],
					['⁵', 'Superscript 5'],
					['⁶', 'Superscript 6'],
					['⁷', 'Superscript 7'],
					['⁸', 'Superscript 8'],
					['⁹', 'Superscript 9']
				]
			},
			{
				name: 'Superscript Letters',
				chars: [
					['ⁱ', 'Superscript i'],
					['ⁿ', 'Superscript n'],
					['ᵃ', 'Superscript a'],
					['ᵇ', 'Superscript b'],
					['ᶜ', 'Superscript c'],
					['ᵈ', 'Superscript d'],
					['ᵉ', 'Superscript e'],
					['ᶠ', 'Superscript f'],
					['ᵍ', 'Superscript g'],
					['ʰ', 'Superscript h'],
					['ʲ', 'Superscript j'],
					['ᵏ', 'Superscript k'],
					['ˡ', 'Superscript l'],
					['ᵐ', 'Superscript m'],
					['ᵒ', 'Superscript o'],
					['ᵖ', 'Superscript p'],
					['ʳ', 'Superscript r'],
					['ˢ', 'Superscript s'],
					['ᵗ', 'Superscript t'],
					['ᵘ', 'Superscript u'],
					['ᵛ', 'Superscript v'],
					['ʷ', 'Superscript w'],
					['ˣ', 'Superscript x'],
					['ʸ', 'Superscript y'],
					['ᶻ', 'Superscript z']
				]
			},
			{
				name: 'Superscript Symbols',
				chars: [
					['⁺', 'Superscript +'],
					['⁻', 'Superscript −'],
					['⁼', 'Superscript ='],
					['⁽', 'Superscript ('],
					['⁾', 'Superscript )']
				]
			},
			{
				name: 'Subscript Digits',
				chars: [
					['₀', 'Subscript 0'],
					['₁', 'Subscript 1'],
					['₂', 'Subscript 2'],
					['₃', 'Subscript 3'],
					['₄', 'Subscript 4'],
					['₅', 'Subscript 5'],
					['₆', 'Subscript 6'],
					['₇', 'Subscript 7'],
					['₈', 'Subscript 8'],
					['₉', 'Subscript 9']
				]
			},
			{
				name: 'Subscript Letters',
				chars: [
					['ₐ', 'Subscript a'],
					['ₑ', 'Subscript e'],
					['ₕ', 'Subscript h'],
					['ᵢ', 'Subscript i'],
					['ⱼ', 'Subscript j'],
					['ₖ', 'Subscript k'],
					['ₗ', 'Subscript l'],
					['ₘ', 'Subscript m'],
					['ₙ', 'Subscript n'],
					['ₒ', 'Subscript o'],
					['ₚ', 'Subscript p'],
					['ᵣ', 'Subscript r'],
					['ₛ', 'Subscript s'],
					['ₜ', 'Subscript t'],
					['ᵤ', 'Subscript u'],
					['ᵥ', 'Subscript v'],
					['ₓ', 'Subscript x']
				]
			},
			{
				name: 'Subscript Symbols',
				chars: [
					['₊', 'Subscript +'],
					['₋', 'Subscript −'],
					['₌', 'Subscript ='],
					['₍', 'Subscript ('],
					['₎', 'Subscript )']
				]
			}
		],
		shortcuts: [
			{ trigger: '\\\\^0', expansion: '⁰' },
			{ trigger: '\\\\^1', expansion: '¹' },
			{ trigger: '\\\\^2', expansion: '²' },
			{ trigger: '\\\\^3', expansion: '³' },
			{ trigger: '\\\\^4', expansion: '⁴' },
			{ trigger: '\\\\^5', expansion: '⁵' },
			{ trigger: '\\\\^6', expansion: '⁶' },
			{ trigger: '\\\\^7', expansion: '⁷' },
			{ trigger: '\\\\^8', expansion: '⁸' },
			{ trigger: '\\\\^9', expansion: '⁹' },
			{ trigger: '\\\\^n', expansion: 'ⁿ' },
			{ trigger: '\\\\^i', expansion: 'ⁱ' },
			{ trigger: '\\\\^+', expansion: '⁺' },
			{ trigger: '\\\\^-', expansion: '⁻' },
			{ trigger: '\\\\_0', expansion: '₀' },
			{ trigger: '\\\\_1', expansion: '₁' },
			{ trigger: '\\\\_2', expansion: '₂' },
			{ trigger: '\\\\_3', expansion: '₃' },
			{ trigger: '\\\\_4', expansion: '₄' },
			{ trigger: '\\\\_5', expansion: '₅' },
			{ trigger: '\\\\_6', expansion: '₆' },
			{ trigger: '\\\\_7', expansion: '₇' },
			{ trigger: '\\\\_8', expansion: '₈' },
			{ trigger: '\\\\_9', expansion: '₉' },
			{ trigger: '\\\\_a', expansion: 'ₐ' },
			{ trigger: '\\\\_e', expansion: 'ₑ' },
			{ trigger: '\\\\_i', expansion: 'ᵢ' },
			{ trigger: '\\\\_n', expansion: 'ₙ' },
			{ trigger: '\\\\_o', expansion: 'ₒ' },
			{ trigger: '\\\\_x', expansion: 'ₓ' },
			{ trigger: '\\\\_+', expansion: '₊' },
			{ trigger: '\\\\_-', expansion: '₋' }
		]
	},
	{
		id: 'pack-fractions',
		name: 'Fractions & Number Forms',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Vulgar Fractions',
				chars: [
					['½', 'One Half'],
					['⅓', 'One Third'],
					['⅔', 'Two Thirds'],
					['¼', 'One Quarter'],
					['¾', 'Three Quarters'],
					['⅕', 'One Fifth'],
					['⅖', 'Two Fifths'],
					['⅗', 'Three Fifths'],
					['⅘', 'Four Fifths'],
					['⅙', 'One Sixth'],
					['⅚', 'Five Sixths'],
					['⅛', 'One Eighth'],
					['⅜', 'Three Eighths'],
					['⅝', 'Five Eighths'],
					['⅞', 'Seven Eighths'],
					['⅐', 'One Seventh'],
					['⅑', 'One Ninth'],
					['⅒', 'One Tenth']
				]
			},
			{
				name: 'Roman Numerals',
				chars: [
					['Ⅰ', 'Roman 1'],
					['Ⅱ', 'Roman 2'],
					['Ⅲ', 'Roman 3'],
					['Ⅳ', 'Roman 4'],
					['Ⅴ', 'Roman 5'],
					['Ⅵ', 'Roman 6'],
					['Ⅶ', 'Roman 7'],
					['Ⅷ', 'Roman 8'],
					['Ⅸ', 'Roman 9'],
					['Ⅹ', 'Roman 10'],
					['Ⅺ', 'Roman 11'],
					['Ⅻ', 'Roman 12'],
					['ⅰ', 'Roman 1 (small)'],
					['ⅱ', 'Roman 2 (small)'],
					['ⅲ', 'Roman 3 (small)'],
					['ⅳ', 'Roman 4 (small)'],
					['ⅴ', 'Roman 5 (small)'],
					['ⅵ', 'Roman 6 (small)'],
					['ⅶ', 'Roman 7 (small)'],
					['ⅷ', 'Roman 8 (small)'],
					['ⅸ', 'Roman 9 (small)'],
					['ⅹ', 'Roman 10 (small)'],
					['ⅺ', 'Roman 11 (small)'],
					['ⅻ', 'Roman 12 (small)']
				]
			}
		],
		shortcuts: [
			{ trigger: '\\\\frac12', expansion: '½' },
			{ trigger: '\\\\frac13', expansion: '⅓' },
			{ trigger: '\\\\frac23', expansion: '⅔' },
			{ trigger: '\\\\frac14', expansion: '¼' },
			{ trigger: '\\\\frac34', expansion: '¾' },
			{ trigger: '\\\\frac15', expansion: '⅕' },
			{ trigger: '\\\\frac25', expansion: '⅖' },
			{ trigger: '\\\\frac35', expansion: '⅗' },
			{ trigger: '\\\\frac45', expansion: '⅘' },
			{ trigger: '\\\\frac16', expansion: '⅙' },
			{ trigger: '\\\\frac56', expansion: '⅚' },
			{ trigger: '\\\\frac18', expansion: '⅛' },
			{ trigger: '\\\\frac38', expansion: '⅜' },
			{ trigger: '\\\\frac58', expansion: '⅝' },
			{ trigger: '\\\\frac78', expansion: '⅞' }
		]
	},
	{
		id: 'pack-typography',
		name: 'Typography',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Dashes & Hyphens',
				chars: [
					['–', 'En Dash'],
					['—', 'Em Dash'],
					['―', 'Horizontal Bar'],
					['‐', 'Hyphen'],
					['‑', 'Non-Breaking Hyphen'],
					['‒', 'Figure Dash']
				]
			},
			{
				name: 'Quotation Marks',
				chars: [
					['«', 'Left Guillemet'],
					['»', 'Right Guillemet'],
					['‹', 'Left Single Guillemet'],
					['›', 'Right Single Guillemet'],
					['„', 'Low Double Quote'],
					['\u201C', 'Left Double Quote'],
					['\u201D', 'Right Double Quote'],
					['‚', 'Low Single Quote'],
					['\u2018', 'Left Single Quote'],
					['\u2019', 'Right Single Quote']
				]
			},
			{
				name: 'Spaces & Breaks',
				chars: [
					['\u00A0', 'Non-Breaking Space'],
					['\u2002', 'En Space'],
					['\u2003', 'Em Space'],
					['\u2009', 'Thin Space'],
					['\u200A', 'Hair Space'],
					['\u200B', 'Zero-Width Space'],
					['\u200C', 'Zero-Width Non-Joiner'],
					['\u200D', 'Zero-Width Joiner'],
					['\u2011', 'Non-Breaking Hyphen'],
					['\u00AD', 'Soft Hyphen']
				]
			},
			{
				name: 'Punctuation & Symbols',
				chars: [
					['…', 'Horizontal Ellipsis'],
					['·', 'Middle Dot'],
					['•', 'Bullet'],
					['‣', 'Triangular Bullet'],
					['⁃', 'Hyphen Bullet'],
					['°', 'Degree'],
					['′', 'Prime (minutes/feet)'],
					['″', 'Double Prime (seconds/inches)'],
					['‴', 'Triple Prime'],
					['※', 'Reference Mark'],
					['†', 'Dagger'],
					['‡', 'Double Dagger'],
					['§', 'Section Sign'],
					['¶', 'Pilcrow / Paragraph'],
					['©', 'Copyright'],
					['®', 'Registered'],
					['™', 'Trademark'],
					['℠', 'Service Mark'],
					['№', 'Numero Sign'],
					['‰', 'Per Mille'],
					['‱', 'Per Myriad']
				]
			},
			{
				name: 'Currency',
				chars: [
					['€', 'Euro'],
					['£', 'Pound Sterling'],
					['¥', 'Yen / Yuan'],
					['₽', 'Russian Ruble'],
					['₴', 'Ukrainian Hryvnia'],
					['₿', 'Bitcoin'],
					['¢', 'Cent'],
					['₹', 'Indian Rupee'],
					['₩', 'Korean Won'],
					['₪', 'Israeli Shekel'],
					['₺', 'Turkish Lira'],
					['₸', 'Kazakh Tenge'],
					['₮', 'Mongolian Tugrik'],
					['₡', 'Colon'],
					['₦', 'Nigerian Naira'],
					['₫', 'Vietnamese Dong'],
					['₲', 'Paraguayan Guarani'],
					['₵', 'Ghana Cedi'],
					['¤', 'Generic Currency']
				]
			}
		],
		shortcuts: [
			{ trigger: '\\\\endash', expansion: '–' },
			{ trigger: '\\\\emdash', expansion: '—' },
			{ trigger: '\\\\laquo', expansion: '«' },
			{ trigger: '\\\\raquo', expansion: '»' },
			{ trigger: '\\\\bdquo', expansion: '„' },
			{ trigger: '\\\\ldquo', expansion: '\u201C' },
			{ trigger: '\\\\rdquo', expansion: '\u201D' },
			{ trigger: '\\\\lsquo', expansion: '\u2018' },
			{ trigger: '\\\\rsquo', expansion: '\u2019' },
			{ trigger: '\\\\hellip', expansion: '…' },
			{ trigger: '\\\\middot', expansion: '·' },
			{ trigger: '\\\\bullet', expansion: '•' },
			{ trigger: '\\\\degree', expansion: '°' },
			{ trigger: '\\\\prime', expansion: '′' },
			{ trigger: '\\\\dprime', expansion: '″' },
			{ trigger: '\\\\sect', expansion: '§' },
			{ trigger: '\\\\para', expansion: '¶' },
			{ trigger: '\\\\copy', expansion: '©' },
			{ trigger: '\\\\reg', expansion: '®' },
			{ trigger: '\\\\tm', expansion: '™' },
			{ trigger: '\\\\numero', expansion: '№' },
			{ trigger: '\\\\permil', expansion: '‰' },
			{ trigger: '\\\\nbsp', expansion: '\u00A0' },
			{ trigger: '\\\\thinsp', expansion: '\u2009' },
			{ trigger: '\\\\zwsp', expansion: '\u200B' },
			{ trigger: '\\\\euro', expansion: '€' },
			{ trigger: '\\\\pound', expansion: '£' },
			{ trigger: '\\\\yen', expansion: '¥' },
			{ trigger: '\\\\ruble', expansion: '₽' },
			{ trigger: '\\\\bitcoin', expansion: '₿' },
			{ trigger: '\\\\rupee', expansion: '₹' }
		]
	},
	{
		id: 'pack-arrows',
		name: 'Arrows',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Simple Arrows',
				chars: [
					['←', 'Left Arrow'],
					['→', 'Right Arrow'],
					['↑', 'Up Arrow'],
					['↓', 'Down Arrow'],
					['↔', 'Left Right Arrow'],
					['↕', 'Up Down Arrow'],
					['↖', 'North West Arrow'],
					['↗', 'North East Arrow'],
					['↘', 'South East Arrow'],
					['↙', 'South West Arrow']
				]
			},
			{
				name: 'Double Arrows',
				chars: [
					['⇐', 'Left Double Arrow'],
					['⇒', 'Right Double Arrow'],
					['⇑', 'Up Double Arrow'],
					['⇓', 'Down Double Arrow'],
					['⇔', 'Left Right Double Arrow'],
					['⇕', 'Up Down Double Arrow'],
					['⇖', 'NW Double Arrow'],
					['⇗', 'NE Double Arrow'],
					['⇘', 'SE Double Arrow'],
					['⇙', 'SW Double Arrow']
				]
			},
			{
				name: 'Long Arrows',
				chars: [
					['⟵', 'Long Left Arrow'],
					['⟶', 'Long Right Arrow'],
					['⟷', 'Long Left Right Arrow'],
					['⟸', 'Long Left Double Arrow'],
					['⟹', 'Long Right Double Arrow'],
					['⟺', 'Long Left Right Double Arrow']
				]
			},
			{
				name: 'Special Arrows',
				chars: [
					['↦', 'Maps To'],
					['↤', 'Maps From'],
					['↪', 'Hook Right Arrow'],
					['↩', 'Hook Left Arrow'],
					['↠', 'Two-Headed Right Arrow'],
					['↞', 'Two-Headed Left Arrow'],
					['↣', 'Right Arrow with Tail'],
					['↢', 'Left Arrow with Tail'],
					['↬', 'Right Arrow with Loop'],
					['↫', 'Left Arrow with Loop'],
					['↭', 'Left Right Wave Arrow'],
					['⇝', 'Right Squiggle Arrow'],
					['⇜', 'Left Squiggle Arrow'],
					['↰', 'Up Arrow with Tip Left'],
					['↱', 'Up Arrow with Tip Right'],
					['↲', 'Down Arrow with Tip Left'],
					['↳', 'Down Arrow with Tip Right'],
					['↴', 'Right Arrow Corner Down'],
					['↵', 'Down Arrow Corner Left'],
					['⏎', 'Return Symbol']
				]
			},
			{
				name: 'Harpoons',
				chars: [
					['⇀', 'Right Harpoon Up'],
					['⇁', 'Right Harpoon Down'],
					['↼', 'Left Harpoon Up'],
					['↽', 'Left Harpoon Down'],
					['⇂', 'Down Harpoon Right'],
					['⇃', 'Down Harpoon Left'],
					['↾', 'Up Harpoon Right'],
					['↿', 'Up Harpoon Left'],
					['⇋', 'Left Right Harpoons'],
					['⇌', 'Right Left Harpoons']
				]
			},
			{
				name: 'Circled & Paired',
				chars: [
					['⊸', 'Multimap'],
					['⟜', 'Left Multimap'],
					['⤺', 'Top Arc Anticlockwise Arrow'],
					['⤻', 'Bottom Arc Anticlockwise Arrow'],
					['↺', 'Anticlockwise Open Circle Arrow'],
					['↻', 'Clockwise Open Circle Arrow'],
					['⇄', 'Right Arrow Over Left Arrow'],
					['⇆', 'Left Arrow Over Right Arrow'],
					['⇅', 'Up Down Arrow'],
					['⇈', 'Upwards Paired Arrows'],
					['⇊', 'Downwards Paired Arrows']
				]
			}
		],
		shortcuts: [
			{ trigger: '\\\\leftarrow', expansion: '←' },
			{ trigger: '\\\\rightarrow', expansion: '→' },
			{ trigger: '\\\\uparrow', expansion: '↑' },
			{ trigger: '\\\\downarrow', expansion: '↓' },
			{ trigger: '\\\\leftrightarrow', expansion: '↔' },
			{ trigger: '\\\\updownarrow', expansion: '↕' },
			{ trigger: '\\\\Leftarrow', expansion: '⇐' },
			{ trigger: '\\\\Rightarrow', expansion: '⇒' },
			{ trigger: '\\\\Uparrow', expansion: '⇑' },
			{ trigger: '\\\\Downarrow', expansion: '⇓' },
			{ trigger: '\\\\Leftrightarrow', expansion: '⇔' },
			{ trigger: '\\\\longleftarrow', expansion: '⟵' },
			{ trigger: '\\\\longrightarrow', expansion: '⟶' },
			{ trigger: '\\\\Longleftarrow', expansion: '⟸' },
			{ trigger: '\\\\Longrightarrow', expansion: '⟹' },
			{ trigger: '\\\\Longleftrightarrow', expansion: '⟺' },
			{ trigger: '\\\\mapsto', expansion: '↦' },
			{ trigger: '\\\\hookrightarrow', expansion: '↪' },
			{ trigger: '\\\\hookleftarrow', expansion: '↩' },
			{ trigger: '\\\\twoheadrightarrow', expansion: '↠' },
			{ trigger: '\\\\rightharpoonup', expansion: '⇀' },
			{ trigger: '\\\\rightharpoondown', expansion: '⇁' },
			{ trigger: '\\\\leftharpoonup', expansion: '↼' },
			{ trigger: '\\\\leftharpoondown', expansion: '↽' },
			{ trigger: '\\\\rightleftharpoons', expansion: '⇌' },
			{ trigger: '\\\\leadsto', expansion: '⇝' },
			{ trigger: '\\\\curvearrowleft', expansion: '↺' },
			{ trigger: '\\\\curvearrowright', expansion: '↻' },
			{ trigger: '\\\\nwarrow', expansion: '↖' },
			{ trigger: '\\\\nearrow', expansion: '↗' },
			{ trigger: '\\\\searrow', expansion: '↘' },
			{ trigger: '\\\\swarrow', expansion: '↙' }
		]
	},
	{
		id: 'pack-box-drawing',
		name: 'Box Drawing',
		version: '1.0.0',
		builtin: false,
		categories: [
			{
				name: 'Light Lines',
				chars: [
					['─', 'Horizontal'],
					['│', 'Vertical'],
					['┌', 'Down and Right'],
					['┐', 'Down and Left'],
					['└', 'Up and Right'],
					['┘', 'Up and Left'],
					['├', 'Vertical and Right'],
					['┤', 'Vertical and Left'],
					['┬', 'Down and Horizontal'],
					['┴', 'Up and Horizontal'],
					['┼', 'Vertical and Horizontal']
				]
			},
			{
				name: 'Heavy Lines',
				chars: [
					['━', 'Heavy Horizontal'],
					['┃', 'Heavy Vertical'],
					['┏', 'Heavy Down and Right'],
					['┓', 'Heavy Down and Left'],
					['┗', 'Heavy Up and Right'],
					['┛', 'Heavy Up and Left'],
					['┣', 'Heavy Vertical and Right'],
					['┫', 'Heavy Vertical and Left'],
					['┳', 'Heavy Down and Horizontal'],
					['┻', 'Heavy Up and Horizontal'],
					['╋', 'Heavy Vertical and Horizontal']
				]
			},
			{
				name: 'Double Lines',
				chars: [
					['═', 'Double Horizontal'],
					['║', 'Double Vertical'],
					['╔', 'Double Down and Right'],
					['╗', 'Double Down and Left'],
					['╚', 'Double Up and Right'],
					['╝', 'Double Up and Left'],
					['╠', 'Double Vertical and Right'],
					['╣', 'Double Vertical and Left'],
					['╦', 'Double Down and Horizontal'],
					['╩', 'Double Up and Horizontal'],
					['╬', 'Double Vertical and Horizontal']
				]
			},
			{
				name: 'Rounded Corners',
				chars: [
					['╭', 'Arc Down and Right'],
					['╮', 'Arc Down and Left'],
					['╯', 'Arc Up and Left'],
					['╰', 'Arc Up and Right']
				]
			},
			{
				name: 'Dashed Lines',
				chars: [
					['┄', 'Light Triple Dash Horizontal'],
					['┅', 'Heavy Triple Dash Horizontal'],
					['┆', 'Light Triple Dash Vertical'],
					['┇', 'Heavy Triple Dash Vertical'],
					['┈', 'Light Quadruple Dash Horizontal'],
					['┉', 'Heavy Quadruple Dash Horizontal'],
					['┊', 'Light Quadruple Dash Vertical'],
					['┋', 'Heavy Quadruple Dash Vertical']
				]
			},
			{
				name: 'Block Elements',
				chars: [
					['█', 'Full Block'],
					['▓', 'Dark Shade'],
					['▒', 'Medium Shade'],
					['░', 'Light Shade'],
					['▀', 'Upper Half Block'],
					['▄', 'Lower Half Block'],
					['▌', 'Left Half Block'],
					['▐', 'Right Half Block'],
					['▔', 'Upper One Eighth Block'],
					['▁', 'Lower One Eighth Block']
				]
			}
		],
		shortcuts: []
	}
];
