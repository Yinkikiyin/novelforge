const express = require('express');
const questions = require('../data/questions');

const router = express.Router();

router.get('/questions', (_req, res) => {
  const sanitized = questions.map(({ dimension, ...q }) => q);
  res.json(sanitized);
});

module.exports = router;
