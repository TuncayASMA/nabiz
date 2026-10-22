# Installation and account setup

[Home](../README.md) · [Türkçe](SETUP.tr.md)

## Before you start

Nabız is a desktop app. A normal download includes Electron; **Node.js is not
needed to run the packaged app**. Some provider CLIs have their own prerequisites.
You need your own accounts and any subscription required by each provider. You
can connect only one or two services; the others remain disconnected.

The current interface is Turkish. Useful labels:

| Label | Meaning |
| --- | --- |
| Hesabı bağla | Connect account |
| Yenile | Refresh |
| Tercihler / Kaydet | Settings / Save |
| Üstte sabitle | Keep on top |
| Oturum açınca başlat | Launch at login |
| Canlı / Eski ölçüm | Live / Stale reading |
| Kullanıldı / sonra yenilenir | Used / Resets in |

## Install the app

Download only from [this repository's Releases](https://github.com/TuncayASMA/nabiz/releases/latest).
Choose `x64` for Intel/AMD 64-bit machines and `arm64` for Apple Silicon, Windows
on ARM or ARM Linux. On Linux/macOS, `uname -m` reports `x86_64` (x64) or
`arm64`/`aarch64` (ARM64). Windows shows the processor type in Settings → System → About.

### Windows

1. Download `Nabiz-VERSION-windows-ARCH-setup.exe`.
2. Open it, choose a per-user installation folder, and finish the wizard.
3. Open the **Nabız** desktop or Start menu shortcut.
4. Optional: turn on **Oturum açınca başlat** in settings.

Portable option: extract **all** files from `Nabiz-VERSION-win-ARCH.zip` into a
permanent folder and run `Nabiz.exe`. Do not run the executable inside the ZIP
or move it away from its supporting files. Startup entries point to that folder.

This release has no commercial code-signing certificate. Windows may report an
unknown publisher. Verify the release URL and checksum before deciding to run
it; where Windows offers a per-app “More info → Run anyway” option, that applies
only to the selected app. Do not disable Defender or system-wide protection.
Managed-device policy may require your administrator's approval.

### macOS

1. Download the `mac-arm64.dmg` for Apple Silicon or `mac-x64.dmg` for Intel.
2. Open the DMG and drag **Nabız** into **Applications**.
3. Launch it from Applications, then eject the DMG. Do not enable startup while
   running the app from the mounted DMG.
4. The menu-bar icon reopens the panel. The pin button controls staying on top.

The initial release is unsigned and not notarized. If macOS blocks opening,
verify the source/checksum, attempt opening once, then consult **System Settings
→ Privacy & Security → Open Anyway**, if offered. Follow [Apple's per-app opening
guidance](https://support.apple.com/en-us/102445). Do not globally disable
Gatekeeper or remove quarantine recursively. On a managed Mac, ask your admin.

Keychain may request permission for Nabız's encrypted storage or Claude's login
item. Unsigned upgrades may prompt again. Denying access leaves the service
disconnected; no Keychain password should be pasted into Nabız.

### Linux

1. Download the AppImage for your architecture and place it in a permanent folder.
2. Mark it executable in the file manager, or run the following using the exact downloaded filename:

   ```sh
   chmod +x Nabiz-VERSION-linux-ARCH.AppImage
   ./Nabiz-VERSION-linux-ARCH.AppImage
   ```

3. Optional: enable launch at login. Nabız writes only its own
   `~/.config/autostart/nabiz.desktop` entry (or the XDG config equivalent).

If AppImage/FUSE is unavailable, extract the `.tar.gz` release into a permanent
folder and run `./Nabiz`. Use your distribution's supported FUSE/desktop packages
if needed. Run as your normal user, not root. Do not disable Chromium's sandbox
as a routine workaround; distribution restrictions on Electron user namespaces
need a distribution-supported configuration.

Tray visibility depends on your desktop. Some GNOME sessions need an
AppIndicator extension. Relaunching the app reveals its existing window if the
tray is hidden. The Linux taskbar entry is retained as a fallback. Wayland may
restrict positioning, global always-on-top or blur behavior.

For encrypted ElevenLabs storage, unlock/configure GNOME Keyring/Secret Service
or KWallet. Nabız refuses `basic_text` storage. Alternatively, pass your own
`ELEVENLABS_API_KEY` in the launching process environment; it will not be saved
without a secure backend. Do not put it in a public script or a `.desktop` file.

### Verify a download

Compare the hash of the **exact filename** against the release's `SHA256SUMS.txt`:

```powershell
Get-FileHash -Algorithm SHA256 .\Nabiz-VERSION-windows-x64-setup.exe
```

```sh
# macOS
shasum -a 256 Nabiz-VERSION-mac-arm64.dmg
# Linux
sha256sum Nabiz-VERSION-linux-x64.AppImage
```

A matching hash detects a changed download. It does not replace publisher
signing or an independent security review.

## Connect providers

Install each CLI using its official instructions, under the **same OS user**
that runs Nabız. On Windows, install native Windows CLIs; a WSL-only login is
not the same environment. Restart Nabız after installing a CLI or changing PATH.
The connect button copies a command; paste it into your own Terminal/PowerShell.

<a id="claude"></a>
### Claude

1. Install [Claude Code](https://code.claude.com/docs/en/setup).
2. Run `claude auth login`, and choose the Claude account/subscription you want to monitor.
3. Complete the browser login, return to Nabız, and press **Yenile**.

Claude credentials are stored in the CLI's own credential file on Windows/Linux
and normally in macOS Keychain. Nabız requests only the named `Claude
Code-credentials` item, with a file fallback. `CLAUDE_CONFIG_DIR` is respected;
custom macOS Keychain service names can be set with
`NABIZ_CLAUDE_KEYCHAIN_SERVICE`. An API-only/Bedrock/Vertex account may not expose
subscription quotas. Expired sessions need a fresh CLI login. See [Claude's
credential documentation](https://code.claude.com/docs/en/authentication).

<a id="codex"></a>
### ChatGPT / Codex

1. Install [Codex CLI](https://learn.chatgpt.com/docs/cli). If using the npm installation, run `npm install -g @openai/codex` with Node.js installed.
2. Run `codex login` and sign in with your ChatGPT account.
3. Refresh Nabız.

Nabız uses the installed CLI's [app-server account rate-limit method](https://learn.chatgpt.com/docs/app-server).
It does not start a conversation or redeem reset credits. Limits depend on the
account/plan; a missing five-hour window is not shown. This card does **not**
claim to track every ChatGPT web conversation limit. API-key billing is outside
this card's scope.

<a id="gemini"></a>
### Gemini / Antigravity

1. Install [Antigravity CLI](https://antigravity.google/docs/install?tab=cli).
2. Run `agy`, then complete the Google account sign-in flow. Exit the CLI after login if desired.
3. Refresh Nabız. Optionally verify the CLI can show `/usage` itself.

The [usage utility](https://antigravity.google/docs/cli/commands/usage/) reports
model groups separately. Argon appears only if your account's response contains
that group; other plans can have different names or pools. Nabız requires a
utility response with zero model turns. No Google API key is bundled or needed
for account-mode monitoring. Legacy Gemini CLI OAuth refresh is not implemented
in this release; use Antigravity.

<a id="grok"></a>
### Grok

1. Install [Grok Build CLI](https://docs.x.ai/build/overview).
2. Run `grok login`, and complete the browser/device authorization.
3. Refresh Nabız.

Nabız reads the OAuth account in the CLI's own auth file. API-key-only entries
are excluded. Multiple OAuth entries are treated as ambiguous; reconnect the
intended account using the CLI. For a near-expiry session Nabız may invoke
`grok models` so Grok can refresh its own credentials. If refresh fails, log in
again. The displayed period and shared-pool note come from the billing response.

<a id="elevenlabs"></a>
### ElevenLabs

1. Sign into [ElevenLabs](https://elevenlabs.io/app) and create your own API key.
2. Give it the **User: Read** permission needed to read your subscription.
3. Open Nabız settings and enter it in **ElevenLabs API anahtarı** → **Kaydet**.
4. The input clears immediately; a stored key is never displayed back to you.

Only [subscription data](https://elevenlabs.io/docs/api-reference/user/subscription/get)
is requested. Nabız does not generate audio. The key is encrypted by the OS
before local persistence; the environment variable `ELEVENLABS_API_KEY` is an
optional alternative. A stored key takes precedence over the environment.
Replace it by saving a new key; revoke an exposed key in ElevenLabs.

## Everyday use

- Drag the title bar to move the widget. Click the pin to keep it above other windows.
- The minus button hides it; the tray/menu-bar icon toggles it. Relaunching also reveals it.
- The settings button controls startup and refresh frequency. Default: pinned, 5-minute refresh, startup off.
- When unpinned, losing focus hides the panel. Settings → **Uygulamadan çık** or the tray menu quits fully.
- Expand **4 kota daha** (or the number shown) to see additional Gemini model pools.
- **Eski ölçüm** is a dated cached result, not a current guarantee. Auth errors clear old account data.
- Manual refresh respects a per-provider one-minute minimum and longer server retry delays.
- A reset timestamp passing does not imply zero usage. The next successful reading supplies the new value.

## Custom CLI locations

Nabız checks PATH, native CLI locations and common Homebrew/local binary paths.
For a nonstandard installation, set `NABIZ_CODEX_PATH`, `NABIZ_AGY_PATH` or
`NABIZ_GROK_PATH` to the **absolute executable path** before launching the app.
On Windows this must be the native `.exe`, not an npm `.cmd` shim. Default Codex
npm native-binary layouts for x64/ARM64 are detected automatically.

GUI apps may not inherit a shell's NVM/asdf PATH. Launch from the configured
terminal or arrange a persistent environment/standard CLI path. Environment
overrides do not carry API keys unless you explicitly supply one yourself.

## Data, updates and uninstall

New installations store data under:

| OS | Directory |
| --- | --- |
| Windows | `%APPDATA%\Nabiz` |
| macOS | `~/Library/Application Support/Nabiz` |
| Linux | `$XDG_CONFIG_HOME/Nabiz` or `~/.config/Nabiz` |

The original local Windows prototype used `%APPDATA%\Kota`; an existing profile
there is retained for compatibility. See [SECURITY](../SECURITY.md) for file
contents. Do not post that directory in issues.

Updates are manual: quit Nabız, download the new matching package, install or
replace the application files, and reopen. Keep a portable/AppImage location
stable; if it moves, toggle startup off/on to update the entry. Settings survive
application updates. Version 0.2 has no background auto-updater.

To uninstall: first turn off launch at login, then quit. Use Windows Installed
Apps for an installer build, move the Mac app to Trash, or remove the portable/
Linux app folder. Remove **only Nabiz's own data directory** if you also want to
erase its settings/cache/encrypted key. This does not log you out of provider
CLIs or revoke an ElevenLabs key; manage those through each provider.

## Troubleshooting

| Problem | Check |
| --- | --- |
| CLI not found | Restart Nabız; check native CLI installation, PATH and absolute-path overrides. |
| Login required after signing in | Use the same OS user/environment; verify the CLI itself sees your account. Reauthenticate an expired session. |
| A provider has no percentage | The plan may not expose quota access, the auth mode may be API-only, or an internal endpoint may have changed. |
| Gemini has no Argon | The account did not report that pool. Nabız does not manufacture it. |
| ElevenLabs key won't save | Unlock/configure an OS keyring. Check User: Read permissions and key validity. |
| Linux panel disappeared | Relaunch it, use its taskbar item, or enable a tray extension in the desktop. |
| Repeated connection failures | Check connectivity/provider status; wait through retry backoff. Never disable TLS checks. |
| macOS keychain prompts after upgrade | Unsigned builds may prompt again; review the per-app access request. |
| Old values after a reset | Wait for a fresh successful reading; cached values are marked stale. |

Windows real-account integration has been exercised. Cross-platform CI uses
fictional data to verify builds/UI and platform logic without credentials.
Claude and Grok usage endpoints are internal interfaces, not a guaranteed public
API contract. macOS Keychain, Linux keyrings and individual provider accounts
still need real-device compatibility feedback. File an issue with app version,
OS/CPU and a redacted description, never raw auth files or keys.
