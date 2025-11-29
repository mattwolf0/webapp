const express = require('express');
const router = express.Router();
const db = require('../db');

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Nincs jogosultság');
  }
  next();
}

router.get('/', (req, res) => {
  const regiok = db.regiok || [];
  const telepulesek = db.telepulesek || [];
  const adok = db.adok || [];

  const regioSet = new Set();
  regiok.forEach(r => {
    if (r.regioNev) {
      regioSet.add(r.regioNev);
    }
  });

  const regioCount = regioSet.size;
  const megyeCount = regiok.length;
  const telepulesCount = telepulesek.length;
  const adoCount = adok.length;

  res.render('index', {
    regioCount,
    megyeCount,
    telepulesCount,
    adoCount
  });
});

router.get('/adatbazis', (req, res) => {
  res.render('adatbazis', {
    adok: db.adok
  });
});

router.get('/kapcsolat', requireLogin, (req, res) => {
  res.render('kapcsolat', {
    hiba: null,
    siker: null
  });
});

router.post('/kapcsolat', requireLogin, (req, res) => {
  const { kuldoNev, kuldoEmail, targy, szoveg } = req.body;

  if (!kuldoNev || !kuldoEmail || !targy || !szoveg) {
    return res.render('kapcsolat', {
      hiba: 'Minden mező kötelező.',
      siker: null
    });
  }

  const id = db.getNextUzenetId();
  const letrehozva = new Date().toISOString();

  db.uzenetek.push({
    id,
    kuldoNev,
    kuldoEmail,
    targy,
    szoveg,
    letrehozva,
    adminValasz: false
  });

  res.render('kapcsolat', {
    hiba: null,
    siker: 'Üzenet elküldve.'
  });
});

router.get('/uzenetek', requireLogin, (req, res) => {
  res.render('uzenetek', {
    uzenetek: db.uzenetek
  });
});

router.get('/admin', requireAdmin, (req, res) => {
  res.render('admin', {
    userCount: db.users.length,
    uzenetCount: db.uzenetek.length,
    adoCount: db.adok.length,
    uzenetek: db.uzenetek,
    users: db.users
  });
});

router.get('/admin/uzenetek/:id/valasz', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const eredeti = db.uzenetek.find(u => u.id === id) || null;

  res.render('uzenet-valasz', {
    eredeti,
    hiba: null
  });
});

router.post('/admin/uzenetek/:id/valasz', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { szoveg } = req.body;
  const eredeti = db.uzenetek.find(u => u.id === id) || null;

  if (!szoveg) {
    return res.render('uzenet-valasz', {
      eredeti,
      hiba: 'A válasz szövege kötelező.'
    });
  }

  const ujId = db.getNextUzenetId();
  const letrehozva = new Date().toISOString();

  db.uzenetek.push({
    id: ujId,
    kuldoNev: 'Admin',
    kuldoEmail: '',
    targy: eredeti ? 'Válasz: ' + eredeti.targy : 'Admin válasz',
    szoveg,
    letrehozva,
    adminValasz: true
  });

  res.redirect('/uzenetek');
});

module.exports = router;
