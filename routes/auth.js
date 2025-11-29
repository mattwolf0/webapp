const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/login', (req, res) => {
  res.render('login', {
    activePage: 'login',
    errorMessage: null,
    infoMessage: null
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).render('login', {
      activePage: 'login',
      errorMessage: 'Hibás felhasználónév vagy jelszó.',
      infoMessage: null
    });
  }

  req.session.user = {
    id: user.id,
    name: user.username,
    email: user.email,
    role: user.role
  };

  res.redirect('/');
});

router.get('/register', (req, res) => {
  res.render('register', {
    activePage: 'register',
    hiba: null,
    siker: null
  });
});

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.render('register', {
      activePage: 'register',
      hiba: 'Minden mező kötelező.',
      siker: null
    });
  }

  const exists = db.users.some(u => u.username === username || u.email === email);
  if (exists) {
    return res.render('register', {
      activePage: 'register',
      hiba: 'Már létezik ilyen felhasználónév vagy e-mail.',
      siker: null
    });
  }

  const id = db.getNextUserId();
  db.users.push({
    id,
    username,
    email,
    password,
    role: 'user'
  });

  res.render('register', {
    activePage: 'register',
    hiba: null,
    siker: 'Sikeres regisztráció. Most már be tudsz jelentkezni.'
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
