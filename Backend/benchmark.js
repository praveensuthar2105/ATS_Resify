const http = require('http');

const WARMUP_URL = 'http://localhost:8080/api/latex/templates';
const GATEWAY_URL = 'http://localhost:8080/api/latex/templates';
const DB_REDIS_URL = 'http://localhost:8081/api/health/full';

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const start = process.hrtime();
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const diff = process.hrtime(start);
                const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;
                if (res.statusCode === 200) {
                    resolve({ durationMs, success: true });
                } else {
                    resolve({ durationMs, success: false, statusCode: res.statusCode });
                }
            });
        }).on('error', (err) => {
            const diff = process.hrtime(start);
            const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;
            resolve({ durationMs, success: false, error: err.message });
        });
    });
}

async function runWarmup() {
    console.log('=== Step 1: Warming up JIT Compiler (100 requests) ===');
    for (let i = 0; i < 100; i++) {
        await makeRequest(WARMUP_URL);
    }
    console.log('Warm-up complete!\n');
}

async function runSequentialTest(url, name, count = 1000) {
    console.log(`=== Step 2: Running Sequential Latency Test for ${name} (${count} requests) ===`);
    const results = [];
    let successes = 0;
    
    const startOverall = Date.now();
    for (let i = 0; i < count; i++) {
        const res = await makeRequest(url);
        results.push(res.durationMs);
        if (res.success) successes++;
    }
    const endOverall = Date.now();
    
    results.sort((a, b) => a - b);
    const sum = results.reduce((a, b) => a + b, 0);
    const avg = sum / results.length;
    const min = results[0];
    const max = results[results.length - 1];
    const p95 = results[Math.floor(results.length * 0.95)];
    const p99 = results[Math.floor(results.length * 0.99)];
    const throughput = (successes / (endOverall - startOverall)) * 1000;
    
    console.log(`Results for ${name}:`);
    console.log(`  - Total Requests: ${count}`);
    console.log(`  - Success Rate  : ${((successes / count) * 100).toFixed(1)}%`);
    console.log(`  - Latency Min   : ${min.toFixed(2)} ms`);
    console.log(`  - Latency Max   : ${max.toFixed(2)} ms`);
    console.log(`  - Latency Avg   : ${avg.toFixed(2)} ms`);
    console.log(`  - 95th Percentile: ${p95.toFixed(2)} ms`);
    console.log(`  - 99th Percentile: ${p99.toFixed(2)} ms`);
    console.log(`  - Throughput    : ${throughput.toFixed(1)} requests/sec\n`);
    
    return { avg, min, max, p95, p99, throughput };
}

async function runConcurrencyTest(url, name, concurrency, totalRequests) {
    console.log(`=== Step 3: Running Concurrency Test for ${name} (Concurrency = ${concurrency}, Total = ${totalRequests}) ===`);
    const results = [];
    let successes = 0;
    let completed = 0;
    
    const startOverall = Date.now();
    
    // Create worker pool
    const promises = [];
    const requestsPerWorker = Math.ceil(totalRequests / concurrency);
    
    async function worker() {
        for (let i = 0; i < requestsPerWorker; i++) {
            if (completed >= totalRequests) break;
            completed++;
            const res = await makeRequest(url);
            results.push(res.durationMs);
            if (res.success) successes++;
        }
    }
    
    for (let i = 0; i < concurrency; i++) {
        promises.push(worker());
    }
    
    await Promise.all(promises);
    const endOverall = Date.now();
    
    results.sort((a, b) => a - b);
    const sum = results.reduce((a, b) => a + b, 0);
    const avg = sum / results.length;
    const min = results[0];
    const max = results[results.length - 1];
    const p95 = results[Math.floor(results.length * 0.95)];
    const throughput = (successes / (endOverall - startOverall)) * 1000;
    
    console.log(`Concurrency Results (Concurrency = ${concurrency}):`);
    console.log(`  - Success Rate  : ${((successes / results.length) * 100).toFixed(1)}%`);
    console.log(`  - Latency Min   : ${min.toFixed(2)} ms`);
    console.log(`  - Latency Max   : ${max.toFixed(2)} ms`);
    console.log(`  - Latency Avg   : ${avg.toFixed(2)} ms`);
    console.log(`  - 95th Percentile: ${p95.toFixed(2)} ms`);
    console.log(`  - Throughput    : ${throughput.toFixed(1)} requests/sec\n`);
    
    return { concurrency, avg, throughput };
}

async function main() {
    console.log('========================================================');
    console.log('          ATS RESIFY SYSTEM BENCHMARK TOOL              ');
    console.log('========================================================\n');
    
    try {
        await runWarmup();
        
        // Test 1: Gateway Routing Latency
        const gatewayMetrics = await runSequentialTest(GATEWAY_URL, 'API Gateway -> Resume Service Templates');
        
        // Test 2: DB & Redis Health check Latency
        const dbRedisMetrics = await runSequentialTest(DB_REDIS_URL, 'Direct Identity Service -> MySQL & Redis Health Check');
        
        // Test 3: Concurrency Loads on Gateway
        console.log('=== Step 4: Measuring API Gateway Throughput under Concurrency ===');
        const c10 = await runConcurrencyTest(GATEWAY_URL, 'API Gateway', 10, 1000);
        const c50 = await runConcurrencyTest(GATEWAY_URL, 'API Gateway', 50, 1000);
        const c100 = await runConcurrencyTest(GATEWAY_URL, 'API Gateway', 100, 1000);
        
        // Test 4: Concurrency Loads on DB & Redis Health check
        console.log('=== Step 5: Measuring DB & Cache Throughput under Concurrency ===');
        const db10 = await runConcurrencyTest(DB_REDIS_URL, 'DB & Redis', 10, 1000);
        const db50 = await runConcurrencyTest(DB_REDIS_URL, 'DB & Redis', 50, 1000);
        
        console.log('========================================================');
        console.log('          BENCHMARK SUMMARY & RESUME METRICS            ');
        console.log('========================================================');
        console.log(`1. API Gateway Routing Efficiency:`);
        console.log(`   - Average Latency: ${gatewayMetrics.avg.toFixed(2)} ms`);
        console.log(`   - 95th Percentile: ${gatewayMetrics.p95.toFixed(2)} ms`);
        console.log(`   - Max Throughput: ${Math.max(c10.throughput, c50.throughput, c100.throughput).toFixed(1)} requests/sec`);
        console.log(``);
        console.log(`2. Database & In-Memory Cache Performance (End-to-End):`);
        console.log(`   - Average health check latency (including MySQL connection + Redis Ping): ${dbRedisMetrics.avg.toFixed(2)} ms`);
        console.log(`   - Max Throughput: ${Math.max(db10.throughput, db50.throughput).toFixed(1)} requests/sec`);
        console.log(`========================================================\n`);
        
    } catch (e) {
        console.error('Benchmark failed:', e);
    }
}

main();
