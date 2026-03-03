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

### App Store build

Requires an Apple Developer account with Team ID and provisioning profiles configured.

```sh
pnpm tauri build --bundles app
```

Then submit via Transporter or `xcrun altool`.
