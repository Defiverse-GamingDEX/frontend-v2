# GamingDex Frontend Setup Guide

This document provides detailed instructions for setting up, developing, and building the GamingDex project. The project has been modernized to use **pnpm 11**, which natively includes enterprise-grade supply chain security features.

## 🛠 Prerequisites

- **Node.js:** v22.x LTS (Recommended to use [nvm](https://github.com/nvm-sh/nvm): `nvm install 22 && nvm use 22`)
- **Package Manager:** pnpm 11.x (`npm install -g pnpm@11`)

---

## 📦 1. Installation

The installation process is fully streamlined and secured natively by pnpm. Run a single command:

```bash
pnpm install
```

### 🛡 pnpm 11 Supply Chain Security
We have completely removed custom security scripts in favor of **pnpm 11's native security features**. These are configured in `pnpm-workspace.yaml` and `.npmrc`:

1. **7-Day Quarantine (`minimumReleaseAge`)**
   - **How it works:** pnpm automatically blocks the installation or resolution of any package (or sub-package) published to the NPM registry within the last 7 days (10,080 minutes). This protects against malicious packages from compromised author accounts.
   - **How to bypass:** If you strictly require a brand new update and know it is safe, add the package name to the `minimumReleaseAgeExclude` array in `pnpm-workspace.yaml`.

2. **Exotic Links Blocking (`blockExoticSubdeps: true`)**
   - **How it works:** Blocks sub-dependencies from using non-registry sources (like GitHub URLs or direct tarballs) which are common vectors for supply chain attacks.
   - **Walletlink Exception:** Our project uses `walletlink` which requires `ethereumjs-abi` via a GitHub URL. To safely bypass this without disabling the global protection, `ethereumjs-abi` has been added as a **direct dependency** in `package.json`.

3. **Registry Metadata Patch (`resolution-mode=highest`)**
   - **How it works:** Because the NPM registry frequently drops the `time` metadata field for standard packages (causing `ERR_PNPM_MISSING_TIME`), `.npmrc` is configured to use the `highest` resolution mode, preventing installation crashes.

### ⚙️ Core Configuration (`.npmrc`)
To ensure compatibility with legacy tools and prevent resolution issues, we enforce the following settings in `.npmrc`:

1. **`node-linker=hoisted`**: Tells pnpm to create a flat `node_modules` structure without symlinks (similar to npm/yarn). This is strictly required because many legacy build tools, webpack loaders, and our Nuxt/Vite configs fail to resolve nested symlinked dependencies.
2. **`auto-install-peers=true`**: Automatically installs peer dependencies, mirroring the default behavior of modern npm (v7+). This prevents hundreds of "missing peer dependency" warnings during installation.
3. **`resolution-mode=highest`**: Bypasses the pnpm 11 default `time-based` resolution algorithm. We MUST keep this because the NPM registry often lacks the required `time` metadata for packages, which would otherwise cause `pnpm install` to crash.

---

## 🚀 2. Development Environment

To start the local development server:

```bash
pnpm run dev
```

This command executes two tasks:
1. `generate:tokenlists`: Automatically fetches and synchronizes the necessary token lists before starting.
2. `vite --force`: Starts the Vite server with forced dependency pre-bundling to invalidate any stale cache and prevent UI synchronization bugs.

---

## 🏗 3. Production Build

When you are ready to build the project into static files for deployment:

```bash
pnpm run build
```

This command also runs `generate:tokenlists` to ensure token data is up-to-date before Vite executes the build. The compiled code will be output to the `dist` directory.

---

## 🔧 Other Useful Utilities

- **Linting & Formatting:** 
  ```bash
  pnpm run lint
  pnpm run prettier
  ```
- **Automatic Fixes:**
  ```bash
  pnpm run lint:fix
  pnpm run prettier:fix
  ```
- **Run Unit Tests:**
  ```bash
  pnpm run test:unit
  ```

---

*Note: If you encounter lockfile errors, please ensure you are no longer using `yarn` or `npm`. All package management operations (adding, removing, updating) MUST be done using `pnpm` from now on (e.g., `pnpm add [package-name]`).*
