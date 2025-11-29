const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', {
    activePage: 'login',
    errorMessage: null,
    infoMessage: req.query.logout ? 'Sikeresen kijelentkeztél.' : null
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user) {
      return res.status(401).render('login', {
        activePage: 'login',
        errorMessage: 'Hibás felhasználónév vagy jelszó.',
        infoMessage: null
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
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
  } catch (err) {
    console.error(err);
    res.status(500).render('login', {
      activePage: 'login',
      errorMessage: 'Hiba történt a bejelentkezés közben.',
      infoMessage: null
    });
  }
});

router.get('/register', (req, res) => {
  res.render('register', {
    activePage: 'register',
    hiba: null,
    siker: null
  });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.render('register', {
      activePage: 'register',
      hiba: 'Minden mező kötelező.',
      siker: null
    });
  }

  try {
    const [rows] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (rows.length > 0) {
      return res.render('register', {
        activePage: 'register',
        hiba: 'Már létezik ilyen felhasználónév vagy e-mail.',
        siker: null
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hash, 'user']
    );

    res.render('register', {
      activePage: 'register',
      hiba: null,
      siker: 'Sikeres regisztráció! Most már be tudsz jelentkezni.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('register', {
      activePage: 'register',
      hiba: 'Hiba történt a regisztráció közben.',
      siker: null
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login?logout=1');
  });
});

module.exports = router;
