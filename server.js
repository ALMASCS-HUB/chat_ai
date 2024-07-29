const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001; // Ensure this port is available

// Middleware
app.use(bodyParser.json());
app.use(express.static('frontend'));

// Initialize GoogleGenerativeAI with your API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/api/send-prompt', async (req, res) => {
  const prompt = req.body.prompt;
  console.log('Received prompt:', prompt); // Log received prompt

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content based on the prompt
    const result = await model.generateContent(prompt);

    // Extract the text response
    const response = await result.response;
    const text = await response.text();

    console.log('Generated text:', text); // Log generated text
    res.json({ reply: text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ reply: 'Error: Failed to generate content' });
  }
});

app.use(express.static('frontend'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
