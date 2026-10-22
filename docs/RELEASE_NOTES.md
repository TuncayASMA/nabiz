Nabız 0.2.1 adds English and Turkish to the desktop UI. A compact usage panel for Claude,
ChatGPT/Codex, Gemini through Antigravity, Grok and ElevenLabs.

- New installations detect the system language; change it instantly in Preferences → Language.
- Existing Turkish installations stay Turkish. The choice survives restarts.
- Menus, quota labels, errors, dates and numbers all follow the selected language.
- Sharper 2× screenshots in both languages; settings remain scrollable in short windows.
- Windows, macOS and Linux packages for x64 and ARM64.
- Pinning, tray/menu-bar access, reset times and configurable refresh.
- Your own accounts; no bundled API keys, telemetry or hosted backend.
- OS-encrypted ElevenLabs storage; no insecure Linux storage fallback.
- English and Turkish interface and installation guides.

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
