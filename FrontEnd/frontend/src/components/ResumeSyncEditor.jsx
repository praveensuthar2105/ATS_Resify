import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const ResumeSyncEditor = () => {
    const [resumeData, setResumeData] = useState(null);
    const [jsonData, setJsonData] = useState('');
    const [latexData, setLatexData] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [activeEditor, setActiveEditor] = useState('form'); // 'form', 'json', or 'latex'

    useEffect(() => {
        // Connect to WebSocket
        const socket = new SockJS('http://localhost:8080/ws-resume');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log('Connected to WebSocket');

            // Subscribe to resume updates
            client.subscribe('/topic/resume/data', (message) => {
                setResumeData(JSON.parse(message.body));
            });

            client.subscribe('/topic/resume/json', (message) => {
                setJsonData(message.body);
            });

            client.subscribe('/topic/resume/latex', (message) => {
                setLatexData(message.body);
            });
        });

        setStompClient(client);

        // Load initial data
        fetchResumeData();

        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, []);

    const fetchResumeData = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/resume-sync/data');
            const data = await response.json();
            setResumeData(data);

            const jsonResponse = await fetch('http://localhost:8080/api/resume-sync/json');
            const jsonResult = await jsonResponse.json();
            setJsonData(jsonResult.json);

            const latexResponse = await fetch('http://localhost:8080/api/resume-sync/latex');
            const latexResult = await latexResponse.json();
            setLatexData(latexResult.latex);
        } catch (error) {
            console.error('Error fetching resume data:', error);
        }
    };

    const updateFromJson = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/resume-sync/update-from-json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ json: jsonData })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Updated from JSON');
            }
        } catch (error) {
            console.error('Error updating from JSON:', error);
        }
    };

    const updateFromLatex = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/resume-sync/update-from-latex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latex: latexData })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Updated from LaTeX');
            }
        } catch (error) {
            console.error('Error updating from LaTeX:', error);
        }
    };

    const updateFromForm = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/resume-sync/update-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resumeData)
            });
            const result = await response.json();
            if (result.success) {
                console.log('Updated from form');
            }
        } catch (error) {
            console.error('Error updating from form:', error);
        }
    };

    return (
        <div className="resume-sync-editor">
            <div className="editor-tabs">
                <button onClick={() => setActiveEditor('form')} className={activeEditor === 'form' ? 'active' : ''}>
                    Form Editor
                </button>
                <button onClick={() => setActiveEditor('json')} className={activeEditor === 'json' ? 'active' : ''}>
                    JSON Editor
                </button>
                <button onClick={() => setActiveEditor('latex')} className={activeEditor === 'latex' ? 'active' : ''}>
                    LaTeX Editor
                </button>
            </div>

            {activeEditor === 'form' && resumeData && (
                <div className="form-editor">
                    <h2>Form Editor</h2>
                    <input
                        type="text"
                        placeholder="Name"
                        value={resumeData.name || ''}
                        onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={resumeData.email || ''}
                        onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        value={resumeData.phone || ''}
                        onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    />
                    <textarea
                        placeholder="Summary"
                        value={resumeData.summary || ''}
                        onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    />
                    <button onClick={updateFromForm}>Update</button>
                </div>
            )}

            {activeEditor === 'json' && (
                <div className="json-editor">
                    <h2>JSON Editor</h2>
                    <textarea
                        value={jsonData}
                        onChange={(e) => setJsonData(e.target.value)}
                        rows={20}
                        style={{ width: '100%', fontFamily: 'monospace' }}
                    />
                    <button onClick={updateFromJson}>Update from JSON</button>
                </div>
            )}

            {activeEditor === 'latex' && (
                <div className="latex-editor">
                    <h2>LaTeX Editor</h2>
                    <textarea
                        value={latexData}
                        onChange={(e) => setLatexData(e.target.value)}
                        rows={20}
                        style={{ width: '100%', fontFamily: 'monospace' }}
                    />
                    <button onClick={updateFromLatex}>Update from LaTeX</button>
                </div>
            )}
        </div>
    );
};

export default ResumeSyncEditor;
