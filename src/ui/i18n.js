(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NabizI18n = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  // Keep all app-owned copy together. Provider/model/plan names stay unchanged.
  const messages = {
    'pin': ['Üstte sabitle', 'Always on top'],
    'settings': ['Ayarlar', 'Settings'],
    'hide': ['Simge durumuna küçült', 'Minimize to tray'],
    'heading': ['Kullanımına bir bakış.', 'Your usage at a glance.'],
    'subtitle': ['Yapay zekâ hesapların, tek yerde.', 'Your AI accounts, in one place.'],
    'providers': ['Servis kullanımları', 'Service usage'],
    'settingsLabel': ['Widget ayarları', 'Widget settings'],
    'preferences': ['Tercihler', 'Preferences'],
    'thisComputer': ['Bu bilgisayar', 'This computer'],
    'startup': ['Oturum açınca başlat', 'Launch at login'],
    'startupHelp': ['Bilgisayara giriş yaptığında hazır olsun.', 'Ready when you sign in to your computer.'],
    'language': ['Dil', 'Language'],
    'interval': ['Otomatik yenileme', 'Auto-refresh'],
    'minutes': ['{count} dakika', '{count} min'],
    'apiKey': ['ElevenLabs API anahtarı', 'ElevenLabs API key'],
    'keyPlaceholder': ['Yeni anahtar gir', 'Enter a new key'],
    'save': ['Kaydet', 'Save'],
    'storageHelp': ['Sistem anahtarlığı ile şifrelenir. Yalnızca kullanım bilgisi okunur.', 'Encrypted with the system keyring. Only usage information is read.'],
    'storageUnavailable': ['Güvenli anahtarlık bulunamadı. Anahtar diske kaydedilmez; sistem anahtarlığını etkinleştir veya ortam değişkenini kullan.', 'No secure keyring found. Keys are not saved to disk; enable the system keyring or use the environment variable.'],
    'settingsHelp': ['Hesap bağlantıları mevcut CLI oturumlarını kullanır. Girişten sonra paneli yenile. ChatGPT kartı Codex kotasını gösterir.', 'Connections use your existing CLI sessions. Refresh after signing in. The ChatGPT card shows Codex usage limits.'],
    'quit': ['Uygulamadan çık', 'Quit Nabız'],
    'refresh': ['Yenile', 'Refresh'],
    'refreshing': ['Yenileniyor', 'Refreshing'],
    'checking': ['Hesaplar kontrol ediliyor', 'Checking accounts'],
    'personalWidget': ['Kişisel masaüstü widget’ı', 'Personal desktop widget'],
    'justNow': ['Az önce', 'Just now'],
    'minutesAgo': ['{count} dk önce', '{count}m ago'],
    'hoursAgo': ['{count} sa önce', '{count}h ago'],
    'daysAgo': ['{count} gün önce', '{count}d ago'],
    'resetUnknown': ['Sıfırlanma saati paylaşılmıyor', 'Reset time not provided'],
    'awaitingReading': ['Yeni ölçüm bekleniyor', 'Waiting for a new reading'],
    'durationDays': ['{days} gün {hours} sa', '{days}d {hours}h'],
    'durationHours': ['{hours} sa {minutes} dk', '{hours}h {minutes}m'],
    'durationMinutes': ['{minutes} dk', '{minutes}m'],
    'resetsIn': ['{duration} sonra yenilenir', 'Resets in {duration}'],
    'used': ['kullanıldı', 'used'],
    'percentUsed': ['Yüzde {value} kullanıldı', '{value}% used'],
    'live': ['Canlı', 'Live'],
    'stale': ['Eski ölçüm', 'Outdated'],
    'auth': ['Giriş gerekli', 'Sign in'],
    'error': ['Bağlantı yok', 'Offline'],
    'loading': ['Bağlanıyor', 'Connecting'],
    'moreQuotas': ['{count} kota daha', '{count} more limits'],
    'outdatedReading': ['Ölçüm güncelliğini yitirdi.', 'This reading is out of date.'],
    'fetchingUsage': ['Kota bilgisi alınıyor', 'Fetching usage limits'],
    'noReading': ['Kota bilgisi henüz alınamadı.', 'Usage information is not available yet.'],
    'addKey': ['API anahtarı ekle', 'Add API key'],
    'connect': ['Hesabı bağla', 'Connect account'],
    'openAccount': ['{name} hesabını aç', 'Open {name} account'],
    'demoData': ['TEST VERİSİ', 'DEMO DATA'],
    'connectedCount': ['{count} / {total} bağlı', '{count} / {total} connected'],
    'connected': ['Bağlı', 'Connected'],
    'notAdded': ['Eklenmedi', 'Not added'],
    'noReadings': ['Henüz ölçüm yok', 'No readings yet'],
    'refreshTime': ['{age} · {minutes} dk aralıkla', '{age} · every {minutes} min'],
    'actionFailed': ['İşlem tamamlanamadı. Yeniden deneyebilirsin.', 'Could not complete the action. Please try again.'],
    'keySaved': ['ElevenLabs bağlantısı kaydedildi.', 'ElevenLabs connection saved.'],
    'commandCopied': ['Komut kopyalandı. Terminalde çalıştırıp giriş yaptıktan sonra Yenile’ye bas.', 'Command copied. Run it in your terminal, sign in, then click Refresh.'],
    'trayOpen': ['Nabız panelini aç', 'Open Nabız'],
    'refreshNow': ['Şimdi yenile', 'Refresh now'],
    'trayStale': ['eski', 'outdated'],
    'notConnected': ['bağlı değil', 'not connected'],
    'loginTitle': ['{name} bağlantısı', 'Connect {name}'],
    'loginMessage': ['Kendi hesabını bağla', 'Connect your own account'],
    'loginDetail': ['CLI kuruluysa Terminal veya PowerShell içinde şu komutu çalıştır:\n\n{command}\n\nTarayıcıda giriş yaptıktan sonra Nabız’da Yenile’ye bas. CLI kurulu değilse kurulum rehberini aç.', 'If the CLI is installed, run this command in Terminal or PowerShell:\n\n{command}\n\nSign in through your browser, then click Refresh in Nabız. If the CLI is not installed, open the setup guide.'],
    'copyCommand': ['Komutu kopyala', 'Copy command'],
    'setupGuide': ['Kurulum rehberi', 'Setup guide'],
    'close': ['Kapat', 'Close'],
    'noKeyring': ['Güvenli sistem anahtarlığı yok. Anahtarlığı etkinleştir veya ELEVENLABS_API_KEY ortam değişkenini kullan.', 'No secure system keyring. Enable it or use the ELEVENLABS_API_KEY environment variable.'],
    'keyFailed': ['Anahtar kaydedilemedi. Geçerli bir API anahtarı gir.', 'Could not save the key. Enter a valid API key.'],
    'provider.codex': ['Codex kotası', 'Codex usage limits'],
    'provider.gemini': ['Antigravity · model kotaları', 'Antigravity · model limits'],
    'provider.elevenlabs': ['Ses üretimi · karakter kotası', 'Voice generation · characters'],
    'quota.weekly': ['Haftalık', 'Weekly'],
    'quota.daily': ['Günlük', 'Daily'],
    'quota.monthly': ['Aylık', 'Monthly'],
    'quota.usage': ['Kullanım', 'Usage'],
    'quota.hours': ['{count} saatlik', '{count}-hour'],
    'quota.minutes': ['{count} dakikalık', '{count}-minute'],
    'quota.modelWeek': ['{model} · hafta', '{model} · week'],
    'quota.modelHours': ['{model} · {count} saat', '{model} · {count}h'],
    'quota.modelPool': ['Model havuzu', 'Model pool'],
    'quota.credits': ['Kredi havuzu', 'Credit pool'],
    'quota.charactersMonthly': ['Aylık karakter', 'Monthly characters'],
    'quota.characters3Months': ['3 aylık karakter', '3-month characters'],
    'quota.characters6Months': ['6 aylık karakter', '6-month characters'],
    'quota.charactersAnnual': ['Yıllık karakter', 'Annual characters'],
    'quota.characters': ['Karakter kotası', 'Character limit'],
    'note.codexReset': ['{count} ücretsiz kota sıfırlama hakkı', '{count} free quota resets available'],
    'note.codex': ['Codex kullanım havuzu', 'Codex usage pool'],
    'note.claude': ['Claude ve Claude Code ortak kullanım', 'Shared Claude and Claude Code usage'],
    'note.geminiCli': ['Gemini CLI kotası · web sohbet kotası ayrı olabilir', 'Gemini CLI quota · web chat limits may differ'],
    'note.grokUnified': ['Chat, Build, Imagine ve Voice ortak havuzu', 'Shared Chat, Build, Imagine and Voice pool'],
    'note.grok': ['Grok Build kullanım havuzu', 'Grok Build usage pool'],
    'note.characters': ['{used} / {limit} karakter · {remaining} kaldı', '{used} / {limit} characters · {remaining} left'],
    'note.antigravity': ['Model gruplarının kotaları birbirinden bağımsız', 'Model groups have separate usage limits'],
    'error.noQuota': ['Hesap şu anda kota bilgisi paylaşmıyor.', 'This account is not reporting usage limits right now.'],
    'error.noCharacters': ['ElevenLabs kullanılabilir karakter limiti bildirmedi.', 'ElevenLabs did not report a usable character limit.'],
    'error.agyFormat': ['Antigravity kota yanıtı tanınmadı.', 'Unrecognized Antigravity usage response.'],
    'error.agyInstall': ['Antigravity CLI kurulumu gerekli. Hesabını bağla.', 'Install Antigravity CLI and connect your account.'],
    'error.agyLogin': ['Antigravity oturumunu açıp yeniden dene.', 'Sign in to Antigravity and try again.'],
    'error.agyRead': ['Antigravity yanıtı okunamadı.', 'Could not read the Antigravity response.'],
    'error.noSession': ['Oturum bulunamadı. Hesabını bağla.', 'No session found. Connect your account.'],
    'error.network': ['Bağlantı kurulamadı. Birazdan tekrar denenecek.', 'Could not connect. Retrying shortly.'],
    'error.expired': ['Oturum süresi dolmuş. Yeniden giriş yap.', 'Your session expired. Sign in again.'],
    'error.access': ['Bu hesap için kota erişimi sağlanamadı.', 'Usage limits are not accessible for this account.'],
    'error.limited': ['Servis yoğun. Son ölçüm korunuyor.', 'Rate limited. Keeping the last reading.'],
    'error.service': ['Servis şu anda yanıt veremiyor.', 'The service is not responding right now.'],
    'error.response': ['Servis yanıtı okunamadı.', 'Could not read the service response.'],
    'error.codexInstall': ['Codex CLI bulunamadı. Codex kurulumu gerekli.', 'Codex CLI was not found. Install Codex first.'],
    'error.codexTimeout': ['Codex yanıtı gecikti. Tekrar denenecek.', 'Codex timed out. Retrying shortly.'],
    'error.codexStart': ['Codex başlatılamadı.', 'Could not start Codex.'],
    'error.codexClosed': ['Codex bağlantısı kapandı.', 'Codex connection closed.'],
    'error.codexLost': ['Codex bağlantısı kesildi.', 'Codex connection was interrupted.'],
    'error.codexRead': ['Codex yanıtı okunamadı.', 'Could not read the Codex response.'],
    'error.codexConnect': ['Codex bağlantısı kurulamadı.', 'Could not connect to Codex.'],
    'error.codexLogin': ['Codex hesabını yeniden bağla.', 'Reconnect your Codex account.'],
    'error.claudeLogin': ['Claude oturumunu yenilemek için yeniden giriş yap.', 'Sign in again to renew your Claude session.'],
    'error.grokMultiple': ['Birden fazla Grok hesabı bulundu. Aktif hesabı belirlemek için giriş yap.', 'Multiple Grok accounts found. Sign in to select the active account.'],
    'error.grokLogin': ['Grok CLI ile hesabına giriş yap.', 'Sign in to your account with Grok CLI.'],
    'error.grokExpired': ['Grok oturumunun süresi dolmuş. Yeniden giriş yap.', 'Your Grok session expired. Sign in again.'],
    'error.elevenKey': ['ElevenLabs API anahtarını ayarlardan ekle.', 'Add your ElevenLabs API key in Settings.'],
    'error.elevenAccess': ['API anahtarını ve User: Read iznini kontrol et.', 'Check your API key and User: Read permission.'],
    'error.read': ['Veri alınamadı. Tekrar denenecek.', 'Could not fetch usage. Retrying shortly.'],
    'error.cached': ['Son ölçüm · güncelleniyor', 'Last reading · updating'],
  };
  const supported = ['tr', 'en'];
  const legacyTemplates = Object.entries(messages).map(([key, pair]) => {
    const parts = pair[0].split(/\{(\w+)\}/);
    const names = parts.filter((_, i) => i % 2);
    const pattern = parts.map((part, i) => i % 2 ? '(.+?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
    return { key, names, pattern: new RegExp(`^${pattern}$`) };
  });
  const locale = language => language === 'tr' ? 'tr-TR' : 'en-US';
  const message = (key, params = {}) => ({ messageKey: key, params });
  function initialLanguage(saved, systemLanguage) {
    if (supported.includes(saved.language)) return saved.language;
    // Upgrades from the Turkish-only release retain their existing UI language.
    if (typeof saved.pinned === 'boolean') return 'tr';
    return /^tr(?:[-_]|$)/i.test(systemLanguage || '') ? 'tr' : 'en';
  }
  function text(language, key, params = {}) {
    const template = messages[key]?.[language === 'tr' ? 0 : 1];
    if (template === undefined) throw new Error(`Unknown translation: ${key}`);
    return template.replace(/\{(\w+)\}/g, (_, name) => typeof params[name] === 'number' ? new Intl.NumberFormat(locale(language), { maximumFractionDigits: 1 }).format(params[name]) : String(params[name] ?? ''));
  }
  function resolve(language, value) {
    if (value && typeof value === 'object' && messages[value.messageKey]) return text(language, value.messageKey, value.params);
    // Read older caches without discarding valid usage measurements.
    if (typeof value === 'string') {
      for (const entry of legacyTemplates) {
        const match = value.match(entry.pattern);
        if (!match) continue;
        const params = Object.fromEntries(entry.names.map((name, i) => {
          const raw = match[i + 1];
          const number = Number(raw.replaceAll('.', '').replace(',', '.'));
          return [name, ['count', 'used', 'limit', 'remaining', 'days', 'hours', 'minutes', 'total', 'value'].includes(name) && Number.isFinite(number) ? number : raw];
        }));
        return text(language, entry.key, params);
      }
    }
    return String(value ?? '');
  }
  function provider(language, value) {
    return { ...value, subtitle: resolve(language, value.subtitle), note: resolve(language, value.note), error: value.error ? resolve(language, value.error) : null, quotas: value.quotas.map(q => ({ ...q, label: resolve(language, q.label) })) };
  }
  return { messages, supported, locale, message, initialLanguage, text, resolve, provider };
});
