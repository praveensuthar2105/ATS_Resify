const fs = require('fs');
const http = require('http');

const URL = 'http://localhost:8083/api/resume/ats-score';

async function testSingleHeavyRequest() {
    console.log('========================================================');
    console.log('       ATS RESIFY - HEAVY REQUEST LATENCY TEST          ');
    console.log('========================================================\n');
    console.log('Measuring end-to-end time for a FULL Gemini AI ATS Score request...');
    
    return new Promise((resolve) => {
        // Create a simple dummy text file to act as our resume
        const fileContent = "John Doe\nSoftware Engineer\nExperience with Java, Spring Boot, JavaScript, Node.js.\nWorked at Tech Corp for 5 years as a Backend Developer.";
        
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        let body = '';
        body += '--' + boundary + '\r\n';
        body += 'Content-Disposition: form-data; name="file"; filename="resume.txt"\r\n';
        body += 'Content-Type: text/plain\r\n\r\n';
        body += fileContent + '\r\n';
        body += '--' + boundary + '--\r\n';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const start = process.hrtime();
        
        const req = http.request(URL, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const diff = process.hrtime(start);
                const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;
                const durationSec = durationMs / 1000;
                
                console.log(`Response Status: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    console.log(`✅ Success! ATS Score generated.`);
                } else {
                    console.log(`❌ Failed!`);
                }
                
                console.log(`\n⏱️ Total Processing Time (including Gemini AI): ${durationSec.toFixed(2)} seconds (${durationMs.toFixed(0)} ms)\n`);
                console.log('========================================================\n');
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            resolve();
        });

        // Write data to request body
        req.write(body);
        req.end();
    });
}

testSingleHeavyRequest();
