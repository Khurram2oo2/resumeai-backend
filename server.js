const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ResumeAI Pro backend running ✅' });
});

app.post('/generate', async (req, res) => {
  try {
    let prompt = '';
    if (req.body.prompt) {
      prompt = req.body.prompt;
    } else if (req.body.messages) {
      prompt = req.body.messages[0]?.content || '';
    }

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a world-class professional resume writer. Write ATS-optimized resumes and cover letters that get people hired.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq error:', JSON.stringify(data));
      return res.status(500).json({ error: data.error?.message || 'Groq API error' });
    }

    const text = data.choices?.[0]?.message?.content || '';

    res.json({
      content: [{ type: 'text', text: text }]
    });

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
