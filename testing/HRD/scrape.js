import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse')
import fs from 'fs';

const readTextFromHRDoc = (filePath, newFilePath) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        pdf(data).then((pdfData) => {
            fs.writeFileSync(newFilePath, pdfData.text, 'utf-8')
            console.log(pdfData.text);
        }).catch((err) => {
            console.error('Error parsing PDF:', err);
        });
    });
}

readTextFromHRDoc('./HR_Docs/Code_of_Conduct.pdf', './sample.pdf');