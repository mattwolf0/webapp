const express = require('express');
const router = express.Router();
const db = require('../db');

const BASE_PATH = '/app013';

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect(BASE_PATH + '/');
  }
  res.render('login', { hiba: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login', { hiba: 'Minden mező kötelező.' });
  }

  const user = db.users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.render('login', { hiba: 'Hibás felhasználónév vagy jelszó.' });
  }

  req.session.user = user;
  res.redirect(BASE_PATH + '/');
});

router.get('/register', (req, res) => {
  res.render('register', { hiba: null });
});

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.render('register', { hiba: 'Minden mező kötelező.' });
  }

  if (db.users.find(u => u.username === username)) {
    return res.render('register', { hiba: 'Ez a felhasználónév már foglalt.' });
  }

  if (db.users.find(u => u.email === email)) {
    return res.render('register', { hiba: 'Ezzel az e-mail címmel már regisztráltak.' });
  }

  const newUser = {
    id: db.getNextUserId(),
    username,
    email,
    password,
    role: 'user'
  };

  db.users.push(newUser);
  res.redirect(BASE_PATH + '/login');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect(BASE_PATH + '/login');
  });
});

module.exports = router;
