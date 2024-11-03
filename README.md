# hackathon-logic-team-project
Hackathon 24 Logic Team's Project
## Projenin Amacı
Bu projenin amacı öğretmen ve öğrencilerin ortak bir platform üzerinde bulunabilecekleri ve birbirleriyle etkileşim içinde kalabilecekleri bir ortam yaratmaktır.<br/>
Öğrencilerin öğretmenlere ve öğretmenlerin öğrencilere erişimini kolaylaştırmak amaçlanmıştır.<br/>
Bir diğer amacımız öğretmenlerin öğrencilere ek kaynak sağlamasını kolaylaştırmaktır. Bu web sitesi basit arayüzü ve kullanıcı dostu özellikleriyle(ücretsiz AI erişimi, ek kaynak sağlama, öğretmen ile öğrenci arasındaki teknolojik bağlantı kurma) eğitime katkıda bulunmaktadır<br/>
Bu projede hedef kitle tüm öğrenci ve öğretmenler olmakla birlikte, duyma engelli öğrencilerin ek kaynak sağlaması açısından büyük önem taşımaktadır<br/>
Projede firebase üzerinden bir e-mail/şifre ile authentication sistemi kullanılmıştır.<br/><br/>
Kayıt olan ve/veya giriş yapan öğrenci ve öğretmenlerin çeşitli verileri firestore veritabanına bağlanmıştır.<br/><br/>
Her öğretmen kendisine ait bir classroomID'si ile kayıt oluyor ve öğrenciler de bu öğretmen tarafından belirlenen classroomID ile kayıt oluyor. Böylece sanal bir sınıf ortamı yaratılmış oluyor. Bu sanal sınıf ortamında öğretmenin öğrencilere ödev atayarak öğrencilerle etkileşim içinde kalması sağlanıyor.<br/>
Öğretmenin öğrencilere ödev ataması ise **GeminiAI** ile gerçekleşiyor. Öğretmenin kendi sekmesinde erişebileceği bir 'MP3-Text Dönüştürücü' bulunuyor. Öğretmen bu dönüştürücüye bir '.mp3' dosyası yüklüyor ve GeminiAI bu '.mp3'ü işleyip yazıya dönüştürüyor. Öğretmen bu yazıyı görüntüleyebiliyor ve yazıyı atamak istediği sınıfın classroomID'sini girip o sınıftaki her öğrencinin sekmesine bu yazıyı atayabiliyor ve yazıyı kaldırabiliyor. 

### Login/Register Sekmesi
Firebase Authentication(e-mail/şifre)'a bağlı bir register ve login sekmesi.
![login](https://github.com/salihalperc/hackathon-logic-team-project/blob/main/images/login.jpg)

### Öğretmen Sekmesi
Öğretmen burada kendi sınıfında olan öğrencileri ve onların iletişim bilgilerini görebilir.<br/>
'MP3-Text Dönüştürücü' **GeminiAI** entegrasyonuna buradan erişim sağlar ve elde ettiği yazıyı görüntüleyip istediği sınıfa tek tuşla atayabilir.
Bu ödevler Firestore'da depolanıyor.
![admin](https://github.com/salihalperc/hackathon-logic-team-project/blob/main/images/admin.jpg)

### Öğrenci Sekmesi
Yüklenmiş olan yazı kimi zamanlar çok uzun olabileceği sebebiyle görüntü kirliliğinin önüne geçmek ve okunabilirliği kolaylaştırmak adına 'Read More' butonu eklenmiştir.
Bu ödevler Firestore'da depolanıyor.
![user](https://github.com/salihalperc/hackathon-logic-team-project/blob/main/images/user.jpg)

## Projenin Eksikleri/Eklenmesi Düşünülen Özellikler
*Öğretmen ve öğrenciler yalnızca bir classroomID ile kayıt olabiliyor. / Birden fazla classroomID'ye erişim yolu eklenebilir.*<br/>
*Clasroomdaki öğrencilere kayıt oldukları bilgiler üzerinden hızlı mail özelliği, sohbet sekmesi eklenebilir ve böylece öğretmen ile öğrenci arasındaki etkileşim daha da güçlenmiş olur.*
