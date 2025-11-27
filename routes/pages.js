const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    regioCount: 0,
    megyeCount: 0,
    telepulesCount: 0,
    adoCount: 0
  });
});

module.exports = router;
