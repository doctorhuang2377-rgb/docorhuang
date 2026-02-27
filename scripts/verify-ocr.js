const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

// 路径配置
const LIB_DIR = path.resolve(__dirname, '../lib/tesseract');
const TEST_IMAGE = path.resolve(__dirname, '../test-data/report-sample.jpg');
const LANG_DATA_PATH = path.join(LIB_DIR, 'lang-data');

async function verifyOcr() {
    console.log('Starting OCR verification...');
    console.log('Lib Directory:', LIB_DIR);
    console.log('Test Image:', TEST_IMAGE);

    // 检查文件是否存在
    if (!fs.existsSync(TEST_IMAGE)) {
        console.error('Test image not found!');
        process.exit(1);
    }

    if (!fs.existsSync(path.join(LIB_DIR, 'worker.min.js'))) {
        console.error('worker.min.js not found in lib/tesseract');
        process.exit(1);
    }
    
    // 注意：Tesseract.js 的 node 版本会自动处理 worker，但在模拟 browser 环境时
    // 我们可能无法完全复现 workerPath 的行为，除非我们在浏览器环境中跑。
    // 但我们可以验证 langPath 是否有效。
    
    // 在 Node 环境下，Tesseract.js 会尝试下载语言包到本地缓存。
    // 为了验证我们的本地语言包是否有效，我们需要配置 langPath 指向本地目录。
    // Tesseract.js 在 Node 环境下对 langPath 的处理可能与浏览器不同，
    // 但我们会尝试强制指定。

    try {
        const worker = await Tesseract.createWorker('chi_sim+eng', 1, {
            logger: m => console.log(m),
            langPath: LANG_DATA_PATH,
            cachePath: LANG_DATA_PATH, // 在 Node 中，cachePath 决定下载位置
            gzip: false
        });

        console.log('Worker created. Recognizing...');
        const { data: { text } } = await worker.recognize(TEST_IMAGE);
        
        console.log('--------------------------------');
        console.log('Recognition Result:');
        console.log(text.substring(0, 500) + '...');
        console.log('--------------------------------');
        
        await worker.terminate();
        console.log('OCR Verification Successful!');
    } catch (error) {
        console.error('OCR Verification Failed:', error);
        process.exit(1);
    }
}

verifyOcr();