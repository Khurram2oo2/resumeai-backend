const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Health check
app.get('/', (req, res) => {
  res.json({ status: 'ResumeAI Pro backend running with Groq ✅' });
});

// ── Main AI generation route (uses Groq — 100% FREE)
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Best free model on Groq
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a world-class professional resume writer and career coach. You write ATS-optimized, impactful resumes and cover letters that get people hired.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('Groq error:', errData);
      return res.status(500).json({ error: errData.error?.message || 'Groq API error' });
    }

    const data = await response.json();

    // Return in same format so index.html works without any changes
    const text = data.choices?.[0]?.message?.content || '';

    res.json({
      content: [{ type: 'text', text: text }]
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ ResumeAI Pro running FREE on Groq — port ${PORT}`);
});
