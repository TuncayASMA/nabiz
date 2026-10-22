# Nabız

**Yapay zekâ kullanımına tek yerden bak.**

[İndir](https://github.com/TuncayASMA/nabiz/releases/latest) · [Ayrıntılı kurulum](SETUP.tr.md) · [English](../README.md)

![Nabız — tamamen örnek hesap verileri](images/preview.png)

Claude, ChatGPT/Codex, Gemini, Grok ve ElevenLabs kullanımını masaüstündeki küçük
bir panelde gösterir. Windows, macOS ve Linux için x64 ve ARM64 paketleri bulunur.
Arayüz Türkçe ve İngilizcedir; kaynak kodu MIT lisansı ile açıktır.

## Neler var?

- Kullanım yüzdeleri, sıfırlanma saatleri ve kalan süre.
- Sürüklenebilir, isteğe göre üstte sabitlenen panel; sistem tepsisi/menü çubuğu.
- 2, 5, 10 veya 15 dakikada yenileme; eski ölçümü tarihli gösterme.
- İsteğe bağlı oturum açılışında başlatma.
- İlk açılışta sistem dilini algılama; **Ayarlar → Dil** ile anında Türkçe/English geçişi.
- Beş servisin gerçek logoları ve ayrı model havuzları.
- Yerel çalışma; Nabız sunucusu, analitik veya ortak API anahtarı yok.
- ElevenLabs anahtarını sistem anahtarlığı ile şifreleme.

## Başlangıç

1. [Releases](https://github.com/TuncayASMA/nabiz/releases/latest) sayfasından işletim sistemine ve işlemcine uygun paketi indir.
2. Windows'ta `setup.exe` dosyasını çalıştır; macOS'ta DMG içindeki uygulamayı Applications'a taşı; Linux'ta AppImage'a çalıştırma izni ver.
3. Kullandığın servislerin CLI uygulamalarını kurup **kendi hesabınla** giriş yap.
4. ElevenLabs kullanıyorsan kendi API anahtarını Nabız ayarlarına ekle.
5. **Yenile** düğmesine bas.

Yeni kurulum, sistemin tercih edilen dili Türkçeyse Türkçe; diğer dillerde İngilizce
açılır. Dil seçimi kaydedilir. Önceki Türkçe sürümden güncellenen kurulumlar Türkçe kalır.

**Paketlerde hesap, abonelik veya API anahtarı bulunmaz.** Yalnız kullandığın
servisleri bağlayabilirsin. İlk sürüm imzasızdır; macOS notarizasyonu yoktur.
Açılış uyarılarının nasıl ele alınacağı [kurulum rehberinde](SETUP.tr.md) açıklanır.

## Hangi kota?

| Kart | Gösterilen kullanım |
| --- | --- |
| Claude | Claude Code hesabının erişebildiği ortak kullanım ve model pencereleri. |
| ChatGPT | **Codex kotasıdır**; ChatGPT web sohbetlerinin tüm limitlerini izlemez. |
| Gemini | Antigravity'nin bildirdiği Argon ve diğer ayrı model havuzları. |
| Grok | Grok CLI hesabının bildirdiği kredi dönemi ve varsa ortak havuz. |
| ElevenLabs | Kullanılan karakter / karakter limiti ve yenilenme zamanı. |

Hesabın paylaşmadığı kota uydurulmaz; farklı havuzlar birleştirilmez. Servislerin
arayüzleri ve planları değiştikçe bağlantılar güncelleme gerektirebilir.

![Nabız ayarları — anahtar girilmemiş örnek ekran](images/settings.png)

## Kaynaktan çalıştırma

```sh
git clone https://github.com/TuncayASMA/nabiz.git
cd nabiz
npm ci
npm run demo
```

Node.js 22.12+ gerekir. Demo gerçek hesaplara bağlanmaz ve ayrı profil kullanır.
`npm start` kendi yerel oturumlarını kullanır. `npm run dist` bulunduğun işletim
sistemi için paket üretir. İndirilen hazır uygulamayı kullanmak için Node.js gerekmez.

[Kurulum ve sorun giderme](SETUP.tr.md) · [Gizlilik/güvenlik](../SECURITY.md) ·
[Katkı rehberi](../CONTRIBUTING.md) · [MIT lisansı](../LICENSE)

Nabız bağımsız bir topluluk projesidir; sağlayıcıların resmî uygulaması değildir.
Marka adları ve logoları ilgili sahiplerine aittir. Ekran görüntüleri tamamen
örnek verilerle üretilmiştir.
