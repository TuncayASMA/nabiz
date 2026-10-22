# Contributing

Bug reports, provider compatibility fixes, translations and accessibility work
are welcome. Open an issue before a large feature. Never attach credentials,
personal account snapshots or private CLI logs.

```sh
git clone https://github.com/TuncayASMA/nabiz.git
cd nabiz
npm ci
npm test
npm run test:ui
npm run demo
```

Use Node.js 22.12 or newer and a graphical desktop. Linux headless testing needs
Xvfb. `npm run dist` builds for the current OS and architecture; signing is not
configured. The release workflow builds Windows, macOS and Linux on native x64
and ARM64 runners. Artifacts are unsigned.

Keep provider adapters read-only. Reject missing/invalid quota data instead of
showing 0%. Preserve reset periods reported by the provider. Mask auth errors,
respect cooldowns and never log raw provider responses. Do not add credentials,
browser-cookie extraction or OAuth client secrets to the repository.

Add focused tests for parsing, platform integration and security changes. Use
fictional data. `npm run screenshots` recreates public images without connecting
to accounts. `node scripts/smoke.cjs --live` is an explicit local-only integration
check and must never run in public CI or provide documentation images.

Before a PR, run tests and `npm run audit:public`. Package with `npm run dist`
and run `node scripts/audit-release.cjs`. Review the actual staged files before
committing. CI does not make a secret scanner infallible.

By contributing, you agree that your contribution is licensed under MIT.
