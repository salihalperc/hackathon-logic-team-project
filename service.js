import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


dotenv.config();

// __dirname declaration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;


app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // for static files


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); 
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'samplesmall.mp3'); //  set file name to 'samplesmall.mp3'  
    }
});

const upload = multer({ storage: storage });

// Uploading and converting file
app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', 'samplesmall.mp3');

    try {
        const fileManager = new GoogleAIFileManager(process.env.API_KEY);
        
        // Upload file
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType: "audio/mp3",
            displayName: "Audio sample",
        });

        // Check condition of uploaded file
        let file = await fileManager.getFile(uploadResult.file.name);
        while (file.state === FileState.PROCESSING) {
            process.stdout.write(".");
            // wait 10 sec
            await new Promise((resolve) => setTimeout(resolve, 10_000));
            // fetch file from API again
            file = await fileManager.getFile(uploadResult.file.name);
        }

        if (file.state === FileState.FAILED) {
            throw new Error("Audio processing failed.");
        }

        console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);

        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            "Make a transcription of audio.",
            {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType,
                },
            },
        ]);

        // result
        res.json({ transcription: result.response.text() });
    } catch (error) {
        console.error('API çağrısında hata:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Transcription failed.' });
    } finally {
        // delete uploaded files
        fs.unlink(filePath, (err) => {
            if (err) console.error('Dosya silinemedi:', err);
        });
    }
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});