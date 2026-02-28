
// Mock calculateStage function (copied from app.js for testing)
function calculateStage(t, n, m) {
    if (m === 'M1c') return 'IVB';
    if (m === 'M1a' || m === 'M1b') return 'IVA';
    if (m === 'Mx') return '无法评估';

    if (n === 'N3') {
        if (['T1a', 'T1b', 'T1c', 'T2a', 'T2b'].includes(t)) return 'IIIB';
        if (['T3', 'T4'].includes(t)) return 'IIIC';
        return '无法评估';
    }

    if (n === 'N2') {
        if (['T1a', 'T1b', 'T1c', 'T2a', 'T2b'].includes(t)) return 'IIIA';
        if (['T3', 'T4'].includes(t)) return 'IIIB';
        return '无法评估';
    }

    if (n === 'N1') {
        if (['T1a', 'T1b', 'T1c', 'T2a'].includes(t)) return 'IIB';
        if (['T2b'].includes(t)) return 'IIB';
        if (['T3', 'T4'].includes(t)) return 'IIIA';
        return '无法评估';
    }

    if (n === 'N0') {
        if (t === 'Tis') return '0';
        if (t === 'T1a') return 'IA1'; // T1a(mi) -> IA1
        if (t === 'T1b') return 'IA2';
        if (t === 'T1c') return 'IA3';
        if (t === 'T2a') return 'IB';
        if (t === 'T2b') return 'IIA';
        if (t === 'T3') return 'IIB';
        if (t === 'T4') return 'IIIA';
        return '无法评估';
    }

    return '无法评估';
}

// Test Cases
const tests = [
    { t: 'T1a', n: 'N0', m: 'M0', expected: 'IA1' },
    { t: 'T1b', n: 'N0', m: 'M0', expected: 'IA2' },
    { t: 'T1c', n: 'N0', m: 'M0', expected: 'IA3' },
    { t: 'T2a', n: 'N0', m: 'M0', expected: 'IB' },
    { t: 'T2b', n: 'N0', m: 'M0', expected: 'IIA' },
    { t: 'T3', n: 'N0', m: 'M0', expected: 'IIB' },
    { t: 'T4', n: 'N0', m: 'M0', expected: 'IIIA' },
    
    { t: 'T1a', n: 'N1', m: 'M0', expected: 'IIB' },
    { t: 'T2a', n: 'N1', m: 'M0', expected: 'IIB' },
    { t: 'T2b', n: 'N1', m: 'M0', expected: 'IIB' },
    { t: 'T3', n: 'N1', m: 'M0', expected: 'IIIA' },
    { t: 'T4', n: 'N1', m: 'M0', expected: 'IIIA' },
    
    { t: 'T1a', n: 'N2', m: 'M0', expected: 'IIIA' },
    { t: 'T2b', n: 'N2', m: 'M0', expected: 'IIIA' },
    { t: 'T3', n: 'N2', m: 'M0', expected: 'IIIB' },
    { t: 'T4', n: 'N2', m: 'M0', expected: 'IIIB' },
    
    { t: 'T1a', n: 'N3', m: 'M0', expected: 'IIIB' },
    { t: 'T2b', n: 'N3', m: 'M0', expected: 'IIIB' },
    { t: 'T3', n: 'N3', m: 'M0', expected: 'IIIC' },
    { t: 'T4', n: 'N3', m: 'M0', expected: 'IIIC' },
    
    { t: 'T1a', n: 'N0', m: 'M1a', expected: 'IVA' },
    { t: 'T4', n: 'N3', m: 'M1c', expected: 'IVB' }
];

let passed = 0;
console.log('Running TNM Staging Tests...\n');

tests.forEach(test => {
    const result = calculateStage(test.t, test.n, test.m);
    if (result === test.expected) {
        console.log(`✅ ${test.t} ${test.n} ${test.m} -> ${result}`);
        passed++;
    } else {
        console.error(`❌ ${test.t} ${test.n} ${test.m} -> Got ${result}, Expected ${test.expected}`);
    }
});

console.log(`\nTest Result: ${passed}/${tests.length} passed.`);
if (passed === tests.length) process.exit(0);
else process.exit(1);
