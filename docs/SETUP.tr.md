# Ayrıntılı kurulum ve hesap bağlantıları

[Proje](README.tr.md) · [English](SETUP.md)

## Gerekenler

Hazır Nabız paketi çalışma zamanını içerir; **uygulamayı açmak için Node.js
kurman gerekmez**. Servislerin CLI araçlarının kendi gereksinimleri olabilir.
Her serviste kendi hesabını ve gerekiyorsa aboneliğini kullanırsın. Beşini de
bağlamak zorunda değilsin; kullanmadıkların bağlantı bekler.

Arayüz **Türkçe ve İngilizce** destekler. İlk kurulumda sistemin tercih edilen
dili Türkçeyse Türkçe, değilse İngilizce seçilir. Üstteki ayar simgesinden
**Tercihler → Dil** (İngilizcede **Preferences → Language**) ile anında değiştirebilirsin.
Seçim kaydedilir; menüler, hatalar, kota açıklamaları, tarih ve sayılar birlikte
değişir. Hesaplarını yeniden bağlaman gerekmez. Eski Türkçe sürümden güncelleme
yapıldığında Türkçe korunur. Uygulamanın adı iki dilde de **Nabız** kalır.

İndirilecek dosyalar yalnız [bu projenin Releases sayfasındadır](https://github.com/TuncayASMA/nabiz/releases/latest).
Intel/AMD 64 bit işlemci için `x64`; Apple Silicon, Windows ARM veya ARM Linux
için `arm64` seç. Windows'ta Ayarlar → Sistem → Hakkında bölümünden işlemci
türünü görebilirsin. Mac/Linux'ta `uname -m`: `x86_64` → x64, `arm64` veya
`aarch64` → ARM64 anlamına gelir.

## Windows kurulumu

1. `Nabiz-SÜRÜM-windows-MİMARİ-setup.exe` dosyasını indir.
2. Kurucuyu aç; kullanıcı hesabına ait kurulum konumunu seçip tamamla.
3. Masaüstündeki veya Başlat menüsündeki **Nabız** kısayolunu aç.
4. İstersen ayarlardan **Oturum açınca başlat** seçeneğini etkinleştir.

Taşınabilir sürüm için `win-….zip` dosyasının **tamamını** kalıcı bir klasöre
çıkart ve `Nabiz.exe` dosyasını aç. EXE'yi tek başına taşıma veya ZIP içinden
çalıştırma; yanındaki dosyalara ihtiyacı var.

İlk sürümün ticari kod imzası yoktur; Windows bilinmeyen yayıncı uyarısı
gösterebilir. İndirme adresini ve aşağıdaki SHA-256 kontrolünü doğruladıktan
sonra uygulamayı çalıştırıp çalıştırmamaya karar ver. Windows'un sunduğu
“Ek bilgi → Yine de çalıştır” seçeneği yalnız seçili uygulama içindir.
Defender'ı veya sistemin genel korumasını kapatma. Kurumsal bilgisayarda
yönetici politikası ayrıca izin gerektirebilir.

## macOS kurulumu

1. Apple Silicon Mac için `mac-arm64.dmg`, Intel Mac için `mac-x64.dmg` indir.
2. DMG'yi aç ve **Nabız** uygulamasını **Applications / Uygulamalar** klasörüne sürükle.
3. Uygulamayı bu klasörden aç, DMG'yi çıkart. Açılışta başlatmayı DMG içinden etkinleştirme.
4. Menü çubuğundaki simgeden paneli tekrar açabilirsin.

İlk sürüm imzasızdır ve Apple notarizasyonu yapılmamıştır. Kaynağı ve dosya
özetini doğruladıktan sonra bir kez açmayı dene. Engellenirse, sunuluyorsa
**Sistem Ayarları → Gizlilik ve Güvenlik → Yine de Aç** seçeneğini kullan.
[Apple'ın uygulama bazında açma rehberini](https://support.apple.com/en-us/102445)
izle. Gatekeeper'ı genel olarak kapatma, klasörlerde toplu karantina kaldırma.

Anahtarlık, Nabız'ın şifreli deposu veya Claude oturumu için izin sorabilir.
İmzasız güncellemelerde bu izin tekrar istenebilir. İzin vermezsen ilgili
bağlantı kurulmaz. Mac anahtarlık parolanı Nabız'a yapıştırma.

## Linux kurulumu

1. İşlemcine uygun `linux-….AppImage` dosyasını indir ve kalıcı bir klasöre koy.
2. Dosya özelliklerinden çalıştırma izni ver veya aşağıdaki komutlarda gerçek indirdiğin dosya adını kullan:

   ```sh
   chmod +x Nabiz-SURUM-linux-MIMARI.AppImage
   ./Nabiz-SURUM-linux-MIMARI.AppImage
   ```

3. İstersen Nabız ayarlarından oturum açılışında başlatmayı etkinleştir.

AppImage/FUSE çalışmıyorsa `.tar.gz` paketini kalıcı klasöre çıkartıp içindeki
`./Nabiz` dosyasını çalıştır. Gerekli FUSE ve masaüstü paketlerini dağıtımının
desteklediği yöntemle kur. Root olarak çalıştırma. Sandbox'ı kapatmayı rutin
çözüm olarak kullanma; Electron kullanıcı ad alanı kısıtlamaları için dağıtımın
desteklediği yapılandırmayı kullan.

Sistem tepsisi masaüstü ortamına bağlıdır; bazı GNOME kurulumları AppIndicator
eklentisi ister. Paneli bulamıyorsan uygulamayı yeniden aç; mevcut pencere
görünür olur. Linux'ta görev çubuğu girişi de korunur. Wayland, pencere konumu
ve sürekli üstte kalma davranışını sınırlayabilir.

ElevenLabs anahtarını güvenle kaydetmek için GNOME Keyring/Secret Service veya
KWallet açık olmalı. Güvenli anahtarlık yoksa Nabız anahtarı diske **kaydetmez**.
İstersen kendi `ELEVENLABS_API_KEY` değişkenini uygulamayı başlatan sürece
verebilirsin; bu durumda anahtar güvenli depo olmadan yalnız bellekte kullanılır.
Anahtarı paylaşılabilir betiklere veya `.desktop` dosyasına yazma.

## İndirmeyi doğrulama

Releases içindeki `SHA256SUMS.txt` dosyasında **aynı dosya adına** ait özetle
karşılaştır:

```powershell
Get-FileHash -Algorithm SHA256 .\Nabiz-SURUM-windows-x64-setup.exe
```

```sh
# macOS
shasum -a 256 Nabiz-SURUM-mac-arm64.dmg
# Linux
sha256sum Nabiz-SURUM-linux-x86_64.AppImage
```

Eşleşme indirdiğin dosyanın değişmediğini denetler; yayıncı imzası veya bağımsız
güvenlik incelemesi yerine geçmez.

## Hesapları bağlama

CLI araçlarını Nabız'ı açtığın **aynı işletim sistemi kullanıcısı** altında kur.
Windows'ta yerel Windows CLI kullan; yalnız WSL içindeki kurulum/giriş farklı
ortamdır. CLI kurduktan veya PATH değiştirdikten sonra Nabız'ı kapatıp aç.
**Hesabı bağla** düğmesi giriş komutunu kopyalamanı veya rehberi açmanı sağlar.
Komutu kendi Terminal/PowerShell pencerende çalıştırırsın.

<a id="claude"></a>
### Claude

1. [Resmî rehberden Claude Code'u kur](https://code.claude.com/docs/en/setup).
2. Terminalde `claude auth login` çalıştır.
3. İzlemek istediğin Claude hesabıyla tarayıcıda giriş yap.
4. Nabız'a dönüp **Yenile** düğmesine bas.

Windows/Linux'ta CLI'nin kendi kimlik dosyası, macOS'ta öncelikle `Claude
Code-credentials` adlı anahtarlık girdisi okunur. `CLAUDE_CONFIG_DIR` desteklenir;
özel macOS anahtarlık servis adı için `NABIZ_CLAUDE_KEYCHAIN_SERVICE` kullanılabilir.
API, Bedrock veya Vertex hesabı bu abonelik kotalarını sağlamayabilir. Süresi
dolan oturumda CLI ile tekrar giriş gerekir. [Kimlik saklama ayrıntıları](https://code.claude.com/docs/en/authentication).

<a id="codex"></a>
### ChatGPT / Codex

1. [Codex CLI kurulumunu](https://learn.chatgpt.com/docs/cli) tamamla. npm yöntemini seçersen Node.js kurulu olmalı; komut `npm install -g @openai/codex`.
2. `codex login` çalıştır ve ChatGPT hesabınla giriş yap.
3. Nabız'da **Yenile** düğmesine bas.

Bu kart **Codex kotasını** gösterir. ChatGPT web sitesindeki bütün sohbet
limitlerini sayan bir sayaç değildir. Sağlayıcı beş saatlik pencere bildirmiyorsa
Nabız böyle bir satır üretmez. Model konuşması başlatılmaz ve sıfırlama hakkı
harcanmaz. Bağlantı [Codex app-server](https://learn.chatgpt.com/docs/app-server)
üzerinden kurulur; API anahtarı faturası kapsam dışıdır.

<a id="gemini"></a>
### Gemini / Antigravity

1. [Antigravity CLI'ı kur](https://antigravity.google/docs/install?tab=cli).
2. Terminalde `agy` çalıştırıp Google hesabınla giriş yap.
3. Girişten sonra CLI'dan çıkabilirsin; Nabız'da **Yenile** düğmesine bas.
4. İstersen CLI içindeki `/usage` komutuyla hesabın kota gösterdiğini kontrol et.

Argon yalnız hesabın yanıtında varsa görünür. Flash/Pro ve diğer model havuzları
ayrı tutulur. Nabız [kota komutunun](https://antigravity.google/docs/cli/commands/usage/)
utility yanıtını ve sıfır model turunu denetler. Google API anahtarı dağıtılmaz.
Eski Gemini CLI OAuth yenilemesi bu sürümde yoktur; Antigravity kullanılır.

<a id="grok"></a>
### Grok

1. [Grok Build CLI'ı kur](https://docs.x.ai/build/overview).
2. `grok login` komutunu çalıştır ve tarayıcı/cihaz doğrulamasını tamamla.
3. Nabız'da **Yenile** düğmesine bas.

CLI'nin OAuth hesabı okunur; yalnız API anahtarıyla kullanılan girişler bu
abonelik takibine dahil edilmez. Birden fazla OAuth hesabı belirsizlik yaratırsa
CLI üzerinden doğru hesabı yeniden bağla. Oturum dolmak üzereyse Nabız,
Grok'un kendi yenilemesini yapması için `grok models` çalıştırabilir. Başarısız
olursa yeniden giriş gerekir. Gösterilen dönem hizmet yanıtından alınır.

<a id="elevenlabs"></a>
### ElevenLabs

1. [ElevenLabs hesabında](https://elevenlabs.io/app) kendi API anahtarını oluştur.
2. Abonelik bilgisini okumak için **User: Read** iznini ver.
3. Nabız ayarlarını aç; **ElevenLabs API anahtarı** alanına yapıştır ve **Kaydet** de.
4. Alan hemen temizlenir; kayıtlı anahtar tekrar gösterilmez.

Yalnız [abonelik bilgisi](https://elevenlabs.io/docs/api-reference/user/subscription/get)
sorgulanır; ses üretilmez. Anahtar sistemin güvenli deposuyla şifrelenir.
İsteğe bağlı `ELEVENLABS_API_KEY` ortam değişkeni de desteklenir; kayıtlı anahtar
varsa önceliklidir. Değiştirmek için yeni anahtarı kaydet. Sızan anahtarı
ElevenLabs üzerinden iptal et.

## Günlük kullanım

- Başlık çubuğundan sürükle; iğne simgesiyle üstte tut.
- Eksi düğmesi gizler, tepsi/menü çubuğu simgesi tekrar açar. Uygulamayı tekrar başlatmak da mevcut pencereyi gösterir.
- Sabitleme kapalıyken başka pencereye geçince panel gizlenir.
- Ayarlardan 2/5/10/15 dakikalık yenilemeyi ve açılışta başlatmayı seç.
- Varsayılan: sabitleme açık, 5 dakikada yenileme, açılışta başlatma kapalı.
- Gemini'deki **4 kota daha** gibi alanlardan ek havuzları aç.
- Tamamen kapatmak için **Uygulamadan çık** veya tepsi menüsündeki **Çıkış** seçeneğini kullan.
- **Eski ölçüm**, tarihli önbellektir. Oturum hatasında eski hesaba ait değerler temizlenir.
- Elle yenileme de servis başına en az 60 saniye ve sunucunun bekleme süresine uyar.
- Sıfırlanma saati geçti diye kullanım otomatik %0 kabul edilmez; yeni ölçüm beklenir.

## CLI özel konumdaysa

Nabız PATH'i, yerel standart kurulumları ve yaygın Homebrew yollarını arar.
Özel kurulumda `NABIZ_CODEX_PATH`, `NABIZ_AGY_PATH`, `NABIZ_GROK_PATH`
değişkenlerine **çalıştırılabilir dosyanın mutlak yolunu** ver.
Windows'ta `.cmd` sarmalayıcı yerine gerçek `.exe` gerekir; Codex'in standart
npm x64/ARM64 dosya düzeni otomatik bulunur.

Masaüstünden açılan uygulama NVM/asdf gibi kabuk ayarlarını miras almayabilir.
Bu durumda yapılandırılmış terminalden aç veya kalıcı ortam/standart CLI
konumu ayarla. CLI yollarının içinde API anahtarı bulunmaz.

## Dosyalar, güncelleme ve kaldırma

| Sistem | Nabız veri dizini |
| --- | --- |
| Windows | `%APPDATA%\Nabiz` |
| macOS | `~/Library/Application Support/Nabiz` |
| Linux | `$XDG_CONFIG_HOME/Nabiz` veya `~/.config/Nabiz` |

İlk Windows prototipinden kalan `%APPDATA%\Kota` profili varsa uyumluluk için
korunur. Bu dizin ayarlar, ayrıştırılmış kullanım önbelleği ve şifreli ElevenLabs
anahtarını içerebilir; issue'lara yükleme. CLI hesap dosyaları bu dizine kopyalanmaz.

Güncelleme: Nabız'ı tamamen kapat, yeni paketi indirip kur/uygulama dosyalarını
değiştir ve yeniden aç. Ayarlar korunur. Taşınabilir sürüm/AppImage klasörünü
taşıdıysan başlangıç seçeneğini kapatıp açarak yolu güncelle. Bu sürümde otomatik
uygulama güncellemesi yoktur.

Kaldırma: önce açılışta başlatmayı kapat ve uygulamadan çık. Windows kurulumlu
sürümünü Yüklü Uygulamalar'dan kaldır; Mac uygulamasını Çöp Sepeti'ne taşı;
taşınabilir/Linux sürümünün klasörünü kaldır. Verileri de silmek istersen
**yalnız Nabız'ın kendi veri dizinini** kaldır. Bu işlem sağlayıcı CLI'larından
çıkış yapmaz veya ElevenLabs anahtarını iptal etmez; onları ilgili servisten yönet.

## Sorun giderme

| Sorun | Çözüm |
| --- | --- |
| CLI bulunamadı | Nabız'ı yeniden aç; yerel kurulum, PATH ve özel dosya yolunu kontrol et. |
| Giriş yaptım, hâlâ giriş istiyor | Aynı kullanıcı/ortam mı? CLI kendi içinde hesabı görüyor mu? Süresi dolan oturumu yenile. |
| Bir servisin yüzdesi yok | Plan kota erişimi vermiyor olabilir; API hesabı farklıdır; dahili uç nokta değişmiş olabilir. |
| Gemini'de Argon yok | Hesap bu havuzu bildirmiyorsa eklenmez. |
| ElevenLabs anahtarı kaydedilemiyor | Sistem anahtarlığını aç/yapılandır; anahtarı ve User: Read iznini kontrol et. |
| Linux'ta panel kayboldu | Uygulamayı tekrar aç, görev çubuğunu kullan veya tepsi desteğini etkinleştir. |
| Bağlantı hatası sürüyor | İnterneti/servis durumunu kontrol et; bekleme süresini geçir. TLS denetimini kapatma. |
| Mac güncelleme sonrası anahtarlık izni istiyor | İmzasız sürüm yeniden izin isteyebilir; uygulama bazında isteği incele. |
| Kota sıfırlandı ama eski sayı duruyor | Başarılı yeni ölçümü bekle; eski veriler ayrıca işaretlenir. |

Windows'ta gerçek hesap bağlantıları doğrulandı. Diğer işletim sistemlerindeki
otomatik testler gerçek anahtarlar kullanmadan paketleme, arayüz ve platform
mantığını sınar. Her hesap/anahtarlık/masaüstü birleşimi gerçek cihazda denenmiş
değildir. Claude ve Grok'un dahili arayüzleri değişebilir. Sorun bildirirken
sürüm, işletim sistemi ve işlemci türünü yaz; anahtar veya ham kimlik dosyası ekleme.
