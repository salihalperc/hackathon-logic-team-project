import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // Dotenv'i kullan
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// .env dosyasını yükle
dotenv.config();

// __dirname tanımlama
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Statik dosyalar için

// Multer ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Klasör yoksa oluştur
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'samplesmall.mp3'); // Dosya adını 'samplesmall.mp3' olarak ayarla
    }
});

const upload = multer({ storage: storage });

// Dosya yükleme ve dönüştürme
app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', 'samplesmall.mp3'); // Dosya yolunu güncelle

    try {
        // Google AI File Manager'ı başlat
        const fileManager = new GoogleAIFileManager(process.env.API_KEY);
        
        // Dosyayı yükle
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType: "audio/mp3",
            displayName: "Audio sample",
        });

        // Yüklenen dosyanın durumunu kontrol et
        let file = await fileManager.getFile(uploadResult.file.name);
        while (file.state === FileState.PROCESSING) {
            process.stdout.write(".");
            // 10 saniye bekle
            await new Promise((resolve) => setTimeout(resolve, 10_000));
            // Dosyayı API'den tekrar al
            file = await fileManager.getFile(uploadResult.file.name);
        }

        if (file.state === FileState.FAILED) {
            throw new Error("Audio processing failed.");
        }

        // İşlem sonucunu yazdır
        console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);

        // Google Generative AI modelini başlat
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // İçerik üret
        const result = await model.generateContent([
            "Make a transcription of audio. And prepare a twop-question-quiz for that transcribe. The format is only text and after that questions. Nothing else.",
            {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType,
                },
            },
        ]);

        // Yanıtı döndür
        res.json({ transcription: result.response.text() });
    } catch (error) {
        console.error('API çağrısında hata:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Transcription failed.' });
    } finally {
        // Yüklenen dosyayı sil
        fs.unlink(filePath, (err) => {
            if (err) console.error('Dosya silinemedi:', err);
        });
    }
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});