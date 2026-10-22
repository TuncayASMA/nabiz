# Security and privacy

Nabız runs locally. There is no Nabız server, telemetry, analytics, account system,
or shared API key. Each person connects their own accounts. Subscription access
and permissions are determined by the provider; this app cannot increase limits.

## What the app accesses

| Service | Local input | Outbound destination |
| --- | --- | --- |
| Claude | Claude Code OAuth credentials; macOS named Keychain item or credential file | `api.anthropic.com` usage endpoint |
| ChatGPT / Codex | Installed Codex CLI, which manages its own login | Codex app-server's `account/rateLimits/read`; provider networking is owned by Codex |
| Gemini | Installed Antigravity CLI and its own signed-in session | CLI `/usage` utility; networking and token rotation are owned by Antigravity |
| Grok | Grok CLI OAuth credential file | `cli-chat-proxy.grok.com` billing endpoint; CLI `models` may refresh an expiring session |
| ElevenLabs | Your own API key from the settings form or environment | `api.elevenlabs.io/v1/user/subscription` |

Nabız does not request chat history, generate text/audio/images, spend reset
credits, or read browser cookies. Raw responses and credentials never enter the
usage cache or renderer. HTTP redirects are rejected, TLS verification remains
enabled, and CLI stderr is discarded. Provider API formats may change.

## Local storage

- `settings.json`: pinning, refresh interval, startup preference, window position.
- `usage-cache.json`: parsed usage percentages, plan labels, reset times and update timestamps. These are private account metadata; don't publish them.
- `elevenlabs-key.enc`: encrypted through Electron `safeStorage` using the OS credential store. File permissions are restricted on Unix.
- Provider login files remain owned by the provider CLI. Nabız does not copy them into its own directory.

Windows uses DPAPI; macOS uses Keychain; Linux needs a supported Secret Service
or KWallet backend. **Nabız refuses to persist keys through Linux `basic_text` or
an unknown/unavailable backend.** A caller-provided `ELEVENLABS_API_KEY` can still
be used from process memory. Environment variables can be read by other software
running with sufficient access. OS encryption also does not protect against all
malware running as your user. See [Electron's storage guarantees](https://www.electronjs.org/docs/latest/api/safe-storage).

The UI is sandboxed, has no Node.js access, cannot open arbitrary windows, and
loads only bundled assets. IPC accepts only the local UI frame. Login buttons
copy fixed provider commands; they do not execute user-supplied shell strings.

## Public artifacts

The app archive has an explicit source/asset allowlist. Local notes, `.env`
files, encrypted keys, auth files, caches, logs and live screenshots are excluded.
`npm run audit:public` scans public files; `node scripts/audit-release.cjs` checks
the packaged archive. Public screenshots are generated only in isolated demo
mode with fictional data. CI uses fixtures and never needs provider credentials.

Runtime has no third-party npm dependencies beyond bundled Electron. Development
dependency audits are separate: the initial release's builder pulls `sprintf-js`
through its download logger, with [a moderate denial-of-service advisory](https://github.com/advisories/GHSA-hp3w-g68c-fv3c).
It is not included in the application archive. Keep build tools and Electron
updated; do not feed untrusted inputs into local build tools.

## Reporting a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/TuncayASMA/nabiz/security/advisories/new).
Include the version, OS, reproduction steps and impact. Never include tokens,
API keys, auth files or an unredacted usage cache in a public issue. If you
accidentally expose a credential, revoke it with the provider immediately.

This first release is community-maintained; there is no guaranteed response SLA.
