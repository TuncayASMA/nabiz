Nabız's first public desktop release: a compact usage panel for Claude,
ChatGPT/Codex, Gemini through Antigravity, Grok and ElevenLabs.

- Windows, macOS and Linux packages for x64 and ARM64.
- Pinning, tray/menu-bar access, reset times and configurable refresh.
- Your own accounts; no bundled API keys, telemetry or hosted backend.
- OS-encrypted ElevenLabs storage; no insecure Linux storage fallback.
- Turkish interface, with English and Turkish installation guides.

**Download the file matching your OS and CPU.** Windows: `setup.exe` (installer)
or `win-*.zip` (portable). macOS: `.dmg` or `.zip`; `arm64` means Apple Silicon,
`x64` means Intel. Linux: `.AppImage` or `.tar.gz`.

Read [installation and account setup](https://github.com/TuncayASMA/nabiz/blob/main/docs/SETUP.md)
or [Türkçe kurulum](https://github.com/TuncayASMA/nabiz/blob/main/docs/SETUP.tr.md).
`SHA256SUMS.txt` lists checksums for every download.

**Limitations:** Binaries are unsigned; macOS is not notarized. The first version
has no automatic updater. Codex usage is not a universal ChatGPT chat limit;
Gemini uses Antigravity model pools. Provider access depends on your plan and
local CLI login. CI tests use demo data; real-account validation has been done
on Windows, not on every OS/account combination. See the setup guide for OS
security prompts, Linux tray/keyring requirements and troubleshooting.
