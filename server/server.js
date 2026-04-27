// server.js - Secure Breach Checker API
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MOCK DATABASE (In production, this would be a secure, indexed database like Redis or ElasticSearch)
// We do NOT store plain text passwords. We store hashes.
const MOCK_BREACH_DB = {
    emails: [
        { id: 'test@example.com', source: 'TechCorp 2023', data: ['Email', 'Password'] },
        { id: 'admin@company.com', source: 'OldSite 2019', data: ['Email'] }
    ],
    phones: [
        { id: '1234567890', source: 'TelecomLeak 2022', data: ['Phone', 'Name'] }
    ],
    // Store hashes of breached passwords (SHA-1)
    // 'password123' -> 7c4a8d09ca3762af61e59520943dc26494f8941b
    passwordHashes: [
        '7c4a8d09ca3762af61e59520943dc26494f8941b',
        '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8'
    ]
};

// Route 1: Search by Identity (Email/Phone)
app.post('/api/search', (req, res) => {
    const { type, query } = req.body;
    
    // Validate input
    if (!query) return res.status(400).json({ error: 'Query required' });

    let found = null;
    if (type === 'email') {
        found = MOCK_BREACH_DB.emails.find(r => r.id === query);
    } else if (type === 'phone') {
        found = MOCK_BREACH_DB.phones.find(r => r.id === query);
    }

    if (found) {
        // Return sanitized breach info
        res.json({ breached: true, sources: [found.source], data: found.data });
    } else {
        res.json({ breached: false });
    }
});

// Route 2: Check Password (k-Anonymity Model)
// The client sends only the first 5 chars of the hash
app.post('/api/check-password', (req, res) => {
    const { prefix } = req.body;

    if (!prefix || prefix.length !== 5) {
        return res.status(400).json({ error: 'Invalid hash prefix' });
    }

    // In a real DB, we would query: SELECT count FROM hashes WHERE hash LIKE 'prefix%'
    // Here we filter our mock array
    const matches = MOCK_BREACH_DB.passwordHashes.filter(h => h.startsWith(prefix.toLowerCase()));

    // For privacy, we return ALL matches for that prefix, or a generic boolean in this simple demo
    if (matches.length > 0) {
        res.json({ breached: true, count: Math.floor(Math.random() * 1000) });
    } else {
        res.json({ breached: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});