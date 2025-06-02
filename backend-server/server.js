const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require("morgan")

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.post('/chat', (req, res) => {
  const { message } = req.body;

  // Simulate a response from the bot
  let botResponse = "I'm not sure how to respond to that.";
  if (message.toLowerCase().includes('directions')) {
    botResponse = "I can help with directions! Where would you like to go?";
  } else if (message.toLowerCase().includes('restaurants')) {
    botResponse = "Here are some restaurants near you: [Restaurant A, Restaurant B, Restaurant C].";
  }

  res.json({ response: botResponse });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});