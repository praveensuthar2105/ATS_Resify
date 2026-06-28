const http = require('http');

const URL = 'http://localhost:8080/api/latex/templates'; // Gateway routing endpoint
const TIMEOUT_MS = 5000; // 5 seconds request timeout

function makeRequest(url) {
    return new Promise((resolve) => {
        const start = process.hrtime();
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const diff = process.hrtime(start);
                const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;
                if (res.statusCode === 200) {
                    resolve({ durationMs, success: true });
                } else {
                    resolve({ durationMs, success: false, error: `HTTP ${res.statusCode}` });
                }
            });
        });

        req.on('error', (err) => {
            const diff = process.hrtime(start);
            const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;
            resolve({ durationMs, success: false, error: err.message });
        });

        req.setTimeout(TIMEOUT_MS, () => {
            req.destroy(new Error('Timeout'));
        });
    });
}

async function runStep(concurrency, totalRequests) {
    console.log(`Testing Concurrency = ${concurrency} (${totalRequests} total requests)...`);
    const results = [];
    let successes = 0;
    let failures = 0;
    let completed = 0;
    
    const startOverall = Date.now();
    const promises = [];
    const requestsPerWorker = Math.ceil(totalRequests / concurrency);
    
    async function worker() {
        for (let i = 0; i < requestsPerWorker; i++) {
            if (completed >= totalRequests) break;
            completed++;
            const res = await makeRequest(URL);
            results.push(res);
            if (res.success) {
                successes++;
            } else {
                failures++;
            }
        }
    }
    
    for (let i = 0; i < concurrency; i++) {
        promises.push(worker());
    }
    
    await Promise.all(promises);
    const endOverall = Date.now();
    
    const durationSec = (endOverall - startOverall) / 1000;
    const throughput = successes / durationSec;
    
    const successRate = (successes / totalRequests) * 100;
    const latencies = results.map(r => r.durationMs).sort((a, b) => a - b);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    
    console.log(`  -> Success Rate: ${successRate.toFixed(1)}% (${successes}/${totalRequests})`);
    console.log(`  -> Average Latency: ${avgLatency.toFixed(2)} ms`);
    console.log(`  -> 95th Percentile: ${p95.toFixed(2)} ms`);
    console.log(`  -> Throughput: ${throughput.toFixed(1)} req/sec\n`);
    
    return {
        concurrency,
        successRate,
        avgLatency,
        p95,
        throughput,
        hasCrashed: successRate < 95.0 || failures > 5
    };
}

async function main() {
    console.log('========================================================');
    console.log('         ATS RESIFY STRESS & BREAKING POINT TEST        ');
    console.log('========================================================\n');
    console.log(`Targeting URL: ${URL}`);
    console.log(`Timeout Threshold: ${TIMEOUT_MS} ms\n`);
    
    const stages = [1000, 2000, 3000, 5000, 7500, 10000];
    let breakingPoint = null;
    let safeLimit = null;
    
    for (const concurrency of stages) {
        const result = await runStep(concurrency, Math.max(1000, concurrency * 2));
        if (result.hasCrashed) {
            breakingPoint = concurrency;
            break;
        }
        safeLimit = concurrency;
    }
    
    console.log('========================================================');
    console.log('                  STRESS TEST RESULTS                   ');
    console.log('========================================================');
    if (breakingPoint) {
        console.log(`💥 System broke at Concurrency level: ${breakingPoint} concurrent requests.`);
        console.log(`✅ Maximum safe load capacity: ${safeLimit} concurrent requests.`);
    } else {
        console.log(`✅ System survived all test stages up to ${stages[stages.length - 1]} concurrent requests!`);
        console.log(`✅ Safe limit is at least: ${stages[stages.length - 1]} concurrency.`);
    }
    console.log('========================================================\n');
}

main();
