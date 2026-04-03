const express = require('express');
const cors = require('cors');

const app = express();

// ── Allow your Hostinger domain to call this backend
app.use(cors({
  origin: '*' // After testing, replace * with your actual domain e.g. 'https://yourdomain.com'
}));

app.use(express.json());

// ── Health check (visit this URL to confirm server is running)
app.get('/', (req, res) => {
  res.json({ status: 'ResumeAI Pro backend is running ✅' });
});

// ── Main AI route — called by index.html
app.post('/generate', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // Stored safely in Railway env vars
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ ResumeAI backend running on port ${PORT}`);
});
