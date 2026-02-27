// Main App Logic
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    // Initialize with default selection
    selectOption('T', 'T1a');
    selectOption('N', 'N0');
    selectOption('M', 'M0');
});

let currentSelection = {
    T: 'T1a',
    N: 'N0',
    M: 'M0'
};

function initUI() {
    // 1. Render Options
    renderOptions('T', TNM_DATA_8TH.T, 't-panel');
    renderOptions('N', TNM_DATA_8TH.N, 'n-panel');
    renderOptions('M', TNM_DATA_8TH.M, 'm-panel');

    // 2. Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons and panels
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and target panel
            e.target.classList.add('active');
            const targetId = e.target.dataset.target;
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 3. Buttons
    document.getElementById('save-btn').addEventListener('click', saveRecord);
    document.getElementById('history-btn').addEventListener('click', showHistory);
    document.getElementById('close-history').addEventListener('click', () => {
        document.getElementById('history-modal').classList.add('hidden');
    });
    document.getElementById('clear-history').addEventListener('click', clearHistory);
    document.getElementById('copy-btn').addEventListener('click', copyReport);
    
    initAnalyzeUI();
}

function initAnalyzeUI() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const analyzeModal = document.getElementById('analyze-modal');
    const closeAnalyze = document.getElementById('close-analyze');
    const clearReport = document.getElementById('clear-report');
    const runAnalyze = document.getElementById('run-analyze');

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            analyzeModal.classList.remove('hidden');
        });
    }

    if (closeAnalyze) {
        closeAnalyze.addEventListener('click', () => {
            analyzeModal.classList.add('hidden');
        });
    }

    if (clearReport) {
        clearReport.addEventListener('click', () => {
            document.getElementById('report-input').value = '';
            document.getElementById('analyze-result').classList.add('hidden');
        });
    }

    // OCR Logic
    const uploadBtn = document.getElementById('upload-btn');
    const ocrUpload = document.getElementById('ocr-upload');
    const ocrProgressContainer = document.getElementById('ocr-progress-container');
    const ocrProgressFill = document.getElementById('ocr-progress-fill');
    const ocrStatus = document.getElementById('ocr-status');
    const reportInput = document.getElementById('report-input');

    if (uploadBtn && ocrUpload) {
        uploadBtn.addEventListener('click', () => {
            ocrUpload.click();
        });

        ocrUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Reset UI
            ocrProgressContainer.classList.remove('hidden');
            ocrProgressFill.style.width = '0%';
            ocrStatus.textContent = '正在初始化...';
            uploadBtn.disabled = true;

            try {
                let text = '';

                if (file.type === 'application/pdf') {
                    ocrStatus.textContent = '正在解析 PDF...';
                    text = await handlePdf(file);
                } else {
                    // Image preprocessing
                    ocrStatus.textContent = '正在优化图像...';
                    const processedImage = await preprocessImage(file);
                    
                    ocrStatus.textContent = '正在初始化 OCR 引擎...';
                    text = await runOcr(processedImage);
                }
                
                // Append text
                const currentText = reportInput.value;
                reportInput.value = (currentText ? currentText + '\n\n' : '') + text;
                
                // Trigger analysis
                analyzeReport(reportInput.value);

                ocrStatus.textContent = '识别完成！';
                ocrProgressFill.style.width = '100%';
                setTimeout(() => {
                    ocrProgressContainer.classList.add('hidden');
                    uploadBtn.disabled = false;
                }, 2000);

            } catch (err) {
                console.error(err);
                ocrStatus.textContent = '识别失败: ' + err.message;
                uploadBtn.disabled = false;
            }
        });
    }

    if (runAnalyze) {
        runAnalyze.addEventListener('click', () => {
            const text = document.getElementById('report-input').value;
            if (!text.trim()) {
                alert('请输入报告内容');
                return;
            }
            analyzeReport(text);
        });
    }
}

async function preprocessImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Grayscale & Contrast
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // Grayscale
                let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                
                // Increase contrast
                // Simple thresholding (Binarization)
                // You can adjust threshold (e.g. 128)
                // Or use dynamic thresholding. For now, simple contrast stretching.
                // Let's do simple binarization for clearer text if it's document
                // But for photos, adaptive is better. Tesseract has internal binarization.
                // So let's just do grayscale and slight contrast boost.
                
                // Contrast factor
                const factor = 1.2; 
                gray = (gray - 128) * factor + 128;
                
                // Clamp
                gray = Math.max(0, Math.min(255, gray));

                data[i] = data[i + 1] = data[i + 2] = gray;
            }

            ctx.putImageData(imgData, 0, 0);
            
            // Return blob
            canvas.toBlob(resolve, 'image/png');
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

async function runOcr(imageBlob) {
    const ocrProgressFill = document.getElementById('ocr-progress-fill');
    const ocrStatus = document.getElementById('ocr-status');

    const worker = await Tesseract.createWorker({
        logger: m => {
            if (m.status === 'recognizing text') {
                const pct = Math.floor(m.progress * 100);
                if (ocrProgressFill) ocrProgressFill.style.width = `${pct}%`;
                if (ocrStatus) ocrStatus.textContent = `识别中... ${pct}%`;
            }
        },
        workerPath: './lib/tesseract/worker.min.js',
        corePath: './lib/tesseract/tesseract-core.wasm.js',
        langPath: './lib/tesseract/lang-data',
        gzip: true
    });

    if (ocrStatus) ocrStatus.textContent = '加载语言包...';
    try {
        await worker.loadLanguage('chi_sim+eng');
        await worker.initialize('chi_sim+eng');
    } catch (e) {
        // Retry without local core path if local load fails
        if (ocrStatus) ocrStatus.textContent = '本地加载失败，尝试CDN...';
        await worker.terminate();
        return await runOcrFallback(imageBlob);
    }

    if (ocrStatus) ocrStatus.textContent = '正在识别文字...';
    const { data: { text } } = await worker.recognize(imageBlob);
    
    await worker.terminate();
    return text;
}

async function runOcrFallback(imageBlob) {
    const ocrProgressFill = document.getElementById('ocr-progress-fill');
    const ocrStatus = document.getElementById('ocr-status');

    const worker = await Tesseract.createWorker({
        logger: m => {
            if (m.status === 'recognizing text') {
                const pct = Math.floor(m.progress * 100);
                if (ocrProgressFill) ocrProgressFill.style.width = `${pct}%`;
                if (ocrStatus) ocrStatus.textContent = `识别中... ${pct}%`;
            }
        },
        gzip: true
    });

    if (ocrStatus) ocrStatus.textContent = '加载语言包 (CDN)...';
    await worker.loadLanguage('chi_sim+eng');
    await worker.initialize('chi_sim+eng');

    if (ocrStatus) ocrStatus.textContent = '正在识别文字...';
    const { data: { text } } = await worker.recognize(imageBlob);
    
    await worker.terminate();
    return text;
}

async function handlePdf(file) {
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdfjs/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    const ocrProgressFill = document.getElementById('ocr-progress-fill');
    const ocrStatus = document.getElementById('ocr-status');

    for (let i = 1; i <= pdf.numPages; i++) {
        if (ocrStatus) ocrStatus.textContent = `正在处理第 ${i}/${pdf.numPages} 页...`;
        const pct = Math.floor((i / pdf.numPages) * 100);
        if (ocrProgressFill) ocrProgressFill.style.width = `${pct}%`;

        const page = await pdf.getPage(i);
        
        // 1. Try extracting text content
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');

        if (pageText.trim().length > 50) {
            // Assume it's a text-based PDF
            fullText += pageText + '\n\n';
        } else {
            // 2. Fallback to OCR (scanned PDF)
            if (ocrStatus) ocrStatus.textContent = `第 ${i} 页为扫描件，正在进行 OCR...`;
            
            const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            // Convert canvas to blob and run OCR
            const blob = await new Promise(r => canvas.toBlob(r));
            // Note: Reuse runOcr might create new worker every page, which is slow.
            // For simplicity in this iteration, we accept it. 
            // Optimally we should reuse worker. But runOcr creates/terminates.
            // Let's just call runOcr.
            const ocrText = await runOcr(blob);
            fullText += ocrText + '\n\n';
        }
    }

    return fullText;
}

function analyzeReport(text) {
    const summary = parseReport(text);

    // Update UI
    selectOption('T', summary.T.code);
    selectOption('N', summary.N.code);
    selectOption('M', summary.M.code);

    // Update Analysis Summary in Modal
    const summaryEl = document.getElementById('analyze-summary');
    const resultDiv = document.getElementById('analyze-result');
    
    let summaryText = ``;
    summaryText += `<div style="margin-bottom:0.5rem"><strong>T分期: ${summary.T.code}</strong><br><span style="font-size:0.85em; color:#666">${summary.T.reasons.join('; ') || '未找到相关描述'}</span></div>`;
    summaryText += `<div style="margin-bottom:0.5rem"><strong>N分期: ${summary.N.code}</strong><br><span style="font-size:0.85em; color:#666">${summary.N.reasons.join('; ') || '未找到相关描述'}</span></div>`;
    summaryText += `<div><strong>M分期: ${summary.M.code}</strong><br><span style="font-size:0.85em; color:#666">${summary.M.reasons.join('; ') || '未找到相关描述'}</span></div>`;
    
    summaryEl.innerHTML = summaryText;
    resultDiv.classList.remove('hidden');
    
    // Also update the main result immediately
    updateResult();
}

function parseReport(text) {
    const summary = {
        T: { code: null, reasons: [] },
        N: { code: null, reasons: [] },
        M: { code: null, reasons: [] }
    };

    // Helper to find matches for a category
    const findMatches = (type, data) => {
        let bestMatch = null;
        let bestIndex = -1;
        let reasons = [];

        data.forEach((item, index) => {
            let matched = false;
            let matchReason = '';

            // Check explicit code (case insensitive)
            // Use word boundary to avoid partial matches (e.g. T1 matching T1a)
            // But strict boundary might fail on "pT1a".
            // Let's use a regex that allows optional prefix like p/c/y and boundary at end
            const codeRegex = new RegExp(`(?:c|p|y)?${item.code}\\b`, 'i');
            if (codeRegex.test(text)) {
                matched = true;
                matchReason = `匹配到明确分期: ${item.code}`;
            }

            // Check keywords
            if (!matched && item.keywords) {
                for (const kw of item.keywords) {
                    try {
                        const kwRegex = new RegExp(kw, 'i');
                        if (kwRegex.test(text)) {
                            matched = true;
                            matchReason = `匹配到关键词: "${kw}"`;
                            break;
                        }
                    } catch (e) {
                        if (text.includes(kw)) {
                            matched = true;
                            matchReason = `匹配到关键词: "${kw}"`;
                            break;
                        }
                    }
                }
            }

            if (matched) {
                // If we found a match, check if it's "higher" than current best
                if (index > bestIndex) {
                    bestIndex = index;
                    bestMatch = item.code;
                }
                reasons.push(`${item.code}: ${matchReason}`);
            }
        });

        return { code: bestMatch, index: bestIndex, reasons };
    };

    // 1. Analyze T (Keywords + Size)
    let tResult = findMatches('T', TNM_DATA_8TH.T);
    
    // Extract size in cm
    const sizeRegex = /(\d+(?:\.\d+)?)\s*(cm|mm|厘米|毫米)/gi;
    let maxCm = 0;
    let match;
    while ((match = sizeRegex.exec(text)) !== null) {
        let val = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === 'mm' || unit === '毫米') {
            val = val / 10;
        }
        if (val > maxCm) maxCm = val;
    }

    if (maxCm > 0) {
        let sizeCode = '';
        if (maxCm <= 1) sizeCode = 'T1a';
        else if (maxCm <= 2) sizeCode = 'T1b';
        else if (maxCm <= 3) sizeCode = 'T1c';
        else if (maxCm <= 4) sizeCode = 'T2a';
        else if (maxCm <= 5) sizeCode = 'T2b';
        else if (maxCm <= 7) sizeCode = 'T3';
        else sizeCode = 'T4';

        const sizeIndex = TNM_DATA_8TH.T.findIndex(item => item.code === sizeCode);
        
        tResult.reasons.push(`${sizeCode}: 基于肿瘤大小 ${maxCm}cm`);

        if (sizeIndex > tResult.index) {
            tResult.code = sizeCode;
            tResult.index = sizeIndex;
        }
    }
    summary.T = tResult;

    // 2. Analyze N
    summary.N = findMatches('N', TNM_DATA_8TH.N);

    // 3. Analyze M
    summary.M = findMatches('M', TNM_DATA_8TH.M);

    // Defaults
    if (!summary.T.code) summary.T.code = 'Tx';
    if (!summary.N.code) summary.N.code = 'Nx'; 
    if (!summary.M.code) summary.M.code = 'Mx'; 

    return summary;
}

function renderOptions(type, data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = `option-item ${currentSelection[type] === item.code ? 'selected' : ''}`;
        div.dataset.code = item.code;
        div.dataset.type = type;
        div.innerHTML = `
            <div class="option-header">
                <span>${item.code}</span>
            </div>
            <div class="option-desc">${item.desc}</div>
        `;
        div.addEventListener('click', () => {
            selectOption(type, item.code);
            // Highlight selection immediately
            container.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
        });
        container.appendChild(div);
    });
}

function selectOption(type, code) {
    currentSelection[type] = code;
    updateResult();
}

function calculateStage(t, n, m) {
    // IASLC 8th Edition Logic (Simplified for clarity)

    // 1. Metastasis (M)
    if (m === 'M1a' || m === 'M1b') return 'IVA';
    if (m === 'M1c') return 'IVB';
    if (m === 'Mx') return '无法评估';

    // 2. N3 Disease
    if (n === 'N3') {
        if (['T3', 'T4'].includes(t)) return 'IIIC';
        return 'IIIB'; // Tx, T0, Tis, T1, T2 -> IIIB
    }

    // 3. N2 Disease
    if (n === 'N2') {
        if (['T3', 'T4'].includes(t)) return 'IIIB';
        return 'IIIA'; // Tx, T0, Tis, T1, T2 -> IIIA
    }

    // 4. N1 Disease
    if (n === 'N1') {
        if (['T3', 'T4'].includes(t)) return 'IIIA';
        if (['T2b'].includes(t)) return 'IIB'; // T2b N1 -> IIB
        return 'IIB'; // Tx, T0, Tis, T1, T2a -> IIB (Wait, T1 N1 is IIB, T2a N1 is IIB)
    }

    // 5. N0 Disease
    if (n === 'N0') {
        if (t === 'T4') return 'IIIA';
        if (t === 'T3') return 'IIB';
        if (t === 'T2b') return 'IIA';
        if (t === 'T2a') return 'IB';
        if (t === 'T1c') return 'IA3';
        if (t === 'T1b') return 'IA2';
        if (t === 'T1a') return 'IA1'; // Includes T1a(mi) if we had it
        if (t === 'Tis') return '0';
        if (t === 'T0') return '0'; // T0 N0 M0 is usually not staged or 0? 
        // Actually T0 N0 M0 is "No evidence of primary tumor", clinical stage 0 if screening? 
        // But usually standard tables start at Tis.
        // Occult Carcinoma: Tx N0 M0
        if (t === 'Tx') return '隐匿性癌';
    }

    // 6. Nx
    if (n === 'Nx') return '无法评估';

    return '未定义组合';
}

function updateResult() {
    const stage = calculateStage(currentSelection.T, currentSelection.N, currentSelection.M);
    const survival = SURVIVAL_RATES[stage] || '数据不足';
    const description = STAGE_DESCRIPTIONS[stage] || '';
    
    document.getElementById('stage-result').textContent = stage;
    document.getElementById('tnm-combo').textContent = `${currentSelection.T} ${currentSelection.N} ${currentSelection.M}`;
    document.getElementById('survival-rate').textContent = survival;
    
    // Update Description
    const descEl = document.getElementById('stage-desc');
    if (descEl) {
        descEl.textContent = description;
        descEl.style.marginTop = '0.5rem';
        descEl.style.fontSize = '0.9rem';
        descEl.style.color = '#6b7280';
    }

    // Update color of badge based on severity
    const badge = document.getElementById('stage-result');
    if (stage.startsWith('IV')) badge.style.backgroundColor = '#ef4444'; // Red
    else if (stage.startsWith('III')) badge.style.backgroundColor = '#f97316'; // Orange
    else if (stage.startsWith('II')) badge.style.backgroundColor = '#eab308'; // Yellow
    else badge.style.backgroundColor = '#3b82f6'; // Blue
}

function saveRecord() {
    const record = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        t: currentSelection.T,
        n: currentSelection.N,
        m: currentSelection.M,
        stage: document.getElementById('stage-result').textContent
    };
    
    let history = JSON.parse(localStorage.getItem('tnm_history') || '[]');
    history.unshift(record);
    localStorage.setItem('tnm_history', JSON.stringify(history));
    alert('保存成功！');
}

function showHistory() {
    const history = JSON.parse(localStorage.getItem('tnm_history') || '[]');
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    
    if (history.length === 0) {
        list.innerHTML = '<li style="padding:1rem; text-align:center; color:#9ca3af;">暂无记录</li>';
    } else {
        history.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                    <strong style="color:var(--primary-color)">${item.stage}</strong>
                    <span class="history-date">${item.date}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.9rem; color:#4b5563;">${item.t} ${item.n} ${item.m}</span>
                    <button class="delete-btn" data-index="${index}" style="color:#ef4444; background:none; border:none; cursor:pointer;">删除</button>
                </div>
            `;
            list.appendChild(li);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deleteRecord(e.target.dataset.index);
            });
        });
    }
    
    document.getElementById('history-modal').classList.remove('hidden');
}

function deleteRecord(index) {
    let history = JSON.parse(localStorage.getItem('tnm_history') || '[]');
    history.splice(index, 1);
    localStorage.setItem('tnm_history', JSON.stringify(history));
    showHistory(); // Refresh list
}

function clearHistory() {
    if(confirm('确定清空所有记录吗？')) {
        localStorage.removeItem('tnm_history');
        showHistory();
    }
}

function copyReport() {
    const stage = document.getElementById('stage-result').textContent;
    const t = currentSelection.T;
    const n = currentSelection.N;
    const m = currentSelection.M;
    const survival = document.getElementById('survival-rate').textContent;
    
    const text = `【肺癌分期报告】\n日期: ${new Date().toLocaleString()}\n----------------\nT分期: ${t}\nN分期: ${n}\nM分期: ${m}\n\n>>> 临床分期: ${stage}\n>>> 5年生存率参考: ${survival}`;
    
    navigator.clipboard.writeText(text)
        .then(() => alert('报告已复制到剪贴板'))
        .catch(err => alert('复制失败，请手动复制'));
}