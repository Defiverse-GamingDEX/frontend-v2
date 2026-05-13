# GamingDex Frontend Setup Guide

This document provides detailed instructions for setting up, developing, and building the GamingDex project after migrating to the new package manager (`pnpm`) and integrating the custom automated security mechanism (Quarantine Check).

## 🛠 Prerequisites

The project is currently optimized to run on a Node.js 18 environment. Although the legacy configuration was Node 16, Node 18.18.2 has been thoroughly tested and runs perfectly.

- **Node.js:** v18.18.2 (Recommended to use [nvm](https://github.com/nvm-sh/nvm): `nvm use 18.18.2`)
- **Package Manager:** pnpm >= 10.x (`npm install -g pnpm`)

---

## 📦 1. Installation

The installation process is now streamlined. You only need to run a single command:

```bash
pnpm install
```

### 🛡 7-Day Quarantine Security Mechanism
During the installation process, the system automatically triggers a security script (`scripts/enforce-quarantine.js`) via the `postinstall` hook.
- **Purpose:** To block the installation of any packages published to NPM **within the last 7 days**. This acts as a critical defense against Supply Chain Attacks.
- **How it works:** The script reads directly from `pnpm-lock.yaml`, sends a request to the NPM registry to verify the publication date, and caches the results in `node_modules/.cache/quarantine-cache.json` to ensure lightning-fast subsequent installs.
- **How to Bypass (Exceptions):** If the project strictly requires a newly published package (< 7 days old) and you are absolutely certain it is safe, open `scripts/enforce-quarantine.js` and add the package explicitly to the `ALLOWLIST` array. 
  *Example:* `'@nuxt/kit@3.21.5'`

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

*Note: If you encounter lockfile errors, please ensure you are no longer using `yarn` or `npm`. All package management operations (adding, removing, updating) MUST be done using `pnpm` from now on (e.g., `pnpm add [package-name]`, `pnpm remove [package-name]`).*
