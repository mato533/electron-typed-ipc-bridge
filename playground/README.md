# electron-app

An Electron application with Vue and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## How to use playground

### pre-request

Built code must exist.

```bash
$ cd <repository-root>
$ pnpm install
$ pnpm build
```

### Install

```bash
$ cd playground
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

## How to E2E tests

### build the library

```bash
$ cd ..
$ TAR_NAME="$(pnpm build)"
```

### Install the library

```bash
$ cd playground/
$ pnpm install "../${TAR_NAME}"
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

### Run the E2E tests
