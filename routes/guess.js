const express = require('express');
const router = express.Router();

let gameSession = [];

router.get('/', (req, res) => {
  res.render('guess', { user: req.user });
});

router.post('/', (req, res) => {
  const { chosen, guess } = req.body;

  gameSession.push({ user: req.user.username, chosen, guess });

  if (gameSession.length < 2) {
    return res.json({ message: 'Waiting for another player...', success: false });
  }

  const [p1, p2] = gameSession;
  const results = [];

  if (p1.guess === p2.chosen) results.push(`${p1.user} guessed correctly!`);
  else results.push(`${p1.user} guessed wrong.`);

  if (p2.guess === p1.chosen) results.push(`${p2.user} guessed correctly!`);
  else results.push(`${p2.user} guessed wrong.`);

  gameSession = []; // reset session

  res.json({ message: results.join(' '), success: true });
});

module.exports = router;
