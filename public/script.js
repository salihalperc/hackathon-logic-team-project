document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Formun varsayılan gönderimini engelle

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Lütfen bir MP3 dosyası yükleyin.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Bir hata oluştu: ' + response.statusText);
        }

        const data = await response.json();
        document.getElementById('result').innerText = data.transcription || 'Metin bulunamadı.';
    } catch (error) {
        console.error('Hata:', error);
        document.getElementById('result').innerText = 'Bir hata oluştu.';
    }
});