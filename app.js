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