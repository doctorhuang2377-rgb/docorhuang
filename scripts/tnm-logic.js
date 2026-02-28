
// IASLC 8th Edition Lung Cancer Staging Matrix
const STAGE_MATRIX = {
    // M1c -> IVB (Any T, Any N)
    M1c: 'IVB',
    // M1a/M1b -> IVA (Any T, Any N)
    M1a: 'IVA',
    M1b: 'IVA',
    
    M0: {
        N3: {
            // T1-T2 -> IIIB
            T1a: 'IIIB', T1b: 'IIIB', T1c: 'IIIB',
            T2a: 'IIIB', T2b: 'IIIB',
            // T3-T4 -> IIIC
            T3: 'IIIC', T4: 'IIIC'
        },
        N2: {
            // T1-T2 -> IIIA
            T1a: 'IIIA', T1b: 'IIIA', T1c: 'IIIA',
            T2a: 'IIIA', T2b: 'IIIA',
            // T3-T4 -> IIIB
            T3: 'IIIB', T4: 'IIIB'
        },
        N1: {
            // T1a-T1c -> IIB
            T1a: 'IIB', T1b: 'IIB', T1c: 'IIB',
            // T2a -> IIB
            T2a: 'IIB', 
            // T2b -> IIB
            T2b: 'IIB',
            // T3-T4 -> IIIA
            T3: 'IIIA', T4: 'IIIA'
        },
        N0: {
            // T1
            T1a: 'IA1', T1b: 'IA2', T1c: 'IA3',
            // T2
            T2a: 'IB', T2b: 'IIA',
            // T3 -> IIB
            T3: 'IIB',
            // T4 -> IIIA
            T4: 'IIIA',
            // Tis -> 0
            Tis: '0'
        }
    }
};

function calculateStage(t, n, m) {
    // 1. Check for Invalid/Missing Data
    if (!t || !n || !m || t === 'Tx' || n === 'Nx' || m === 'Mx') {
        return '无法评估';
    }

    // 2. Check Distant Metastasis (M1)
    if (m === 'M1c') return STAGE_MATRIX.M1c;
    if (m === 'M1a' || m === 'M1b') return STAGE_MATRIX.M1a;

    // 3. Check M0 Combinations
    if (m === 'M0') {
        const nGroup = STAGE_MATRIX.M0[n];
        if (!nGroup) return '无法评估'; // Invalid N

        // Handle T-stage mapping if needed
        // The matrix uses specific keys.
        const stage = nGroup[t];
        if (stage) return stage;

        // Fallback for grouped T codes if not explicitly in matrix?
        // Our matrix covers T1a-T4.
        // What about 'T1'? T1 is usually generic, can't stage precisely without subcategory.
        // But for safety, T1 usually implies at least IA. 
        // Let's assume input is specific. If not, return "无法评估" or specific warning.
        return '无法评估';
    }

    return '无法评估';
}
