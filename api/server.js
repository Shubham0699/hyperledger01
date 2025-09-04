const express = require('express');
const bodyParser = require('body-parser');
const registerUser = require('./registerUser');
const loginUser = require('./loginUser');

const app = express();
app.use(bodyParser.json());

// Register endpoint
app.post('/register', async (req, res) => {
  const { username } = req.body;
  try {
    await registerUser(username);
    res.status(200).send(` User ${username} registered and enrolled`);
  } catch (err) {
    res.status(500).send(` Failed to register: ${err}`);
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username } = req.body;
  try {
    const result = await loginUser(username);
    res.status(200).send({ message: ` User ${username} authenticated`, ledger: result });
  } catch (err) {
    res.status(401).send(` Authentication failed: ${err}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
