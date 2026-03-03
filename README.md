# Hot Symbols

macOS menu-bar utility for quick access to Unicode symbols, emoji, and special characters.

## Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+
- Xcode Command Line Tools (`xcode-select --install`)

## Setup

```sh
pnpm install
```

## Development

```sh
pnpm tauri dev
```

This starts the Vite dev server with HMR and launches the Tauri app window.

## Build

### Debug build

```sh
pnpm tauri build --debug
```

### Release build

```sh
pnpm tauri build
```

The `.app` bundle is output to `src-tauri/target/release/bundle/macos/`.

### Generate icons

`pnpm tauri icon src-tauri/icons/icon.png`

### Apple Silicon

`pnpm tauri build --target aarch64-apple-darwin`

### Apple Intel

`pnpm tauri build --target x86_64-apple-darwin`

# Apple Universal (fat binary, both architectures)

`rustup target add x86_64-apple-darwin`
`pnpm tauri build --target universal-apple-darwin`

### App Store build

Requires an Apple Developer account with Team ID and provisioning profiles configured.

```sh
pnpm tauri build --bundles app
```

Then submit via Transporter.

## CI/CD

GitHub Actions workflows are in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `build-macos.yml` | Tag `v*` / manual | Builds `.dmg` for Universal, Apple Silicon, Intel |
| `build-windows.yml` | Tag `v*` / manual | Builds `.msi` + `.exe` for x86_64, ARM64 |
| `deploy-landing.yml` | Push to `master` (landing/) | Deploys landing page to GitHub Pages |

### Code Signing & Notarization (macOS)

Without signing, users will see a Gatekeeper warning and have to open the app via right-click -> Open.

1. Create a **Developer ID Application** certificate at [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list)
2. Export it as `.p12` from Keychain Access (set a password)
3. Create an **App-Specific Password** at [appleid.apple.com](https://appleid.apple.com/) -> Sign-In and Security -> App-Specific Passwords
4. Add these **GitHub Secrets** (Settings -> Secrets and variables -> Actions):

| Secret | Value |
|--------|-------|
| `APPLE_CERTIFICATE` | `.p12` file encoded as base64: `base64 -i cert.p12 \| pbcopy` |
| `APPLE_CERTIFICATE_PASSWORD` | Password you set when exporting `.p12` |
| `APPLE_ID` | Your Apple ID email |
| `APPLE_PASSWORD` | App-Specific Password from step 3 |
| `APPLE_TEAM_ID` | 10-character Team ID from [developer.apple.com/account](https://developer.apple.com/account) |

1. Update `build-macos.yml` to install the certificate and run notarization (see Tauri [code signing guide](https://v2.tauri.app/distribute/sign/macos/))
