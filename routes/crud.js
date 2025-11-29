const express = require('express');
const router = express.Router();
const db = require('../db');

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Nincs jogosultság');
  }
  next();
}

router.get('/', (req, res) => {
  res.render('crud', {
    adok: db.adok,
    message: null
  });
});

router.get('/new', requireAdmin, (req, res) => {
  res.render('crud-form', {
    ado: null,
    hiba: null
  });
});

router.get('/edit/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ado = db.adok.find(a => a.id === id) || null;

  if (!ado) {
    return res.redirect('/crud');
  }

  res.render('crud-form', {
    ado,
    hiba: null
  });
});

router.post('/save', requireAdmin, (req, res) => {
  const { id, frekvencia, teljesitmeny, csatorna, cim, telepulesNev, megyeNev, regioNev } = req.body;

  if (!frekvencia || !teljesitmeny || !csatorna || !cim) {
    const ado = {
      id: id ? parseInt(id, 10) : null,
      frekvencia,
      teljesitmeny,
      csatorna,
      cim,
      telepulesNev,
      megyeNev,
      regioNev
    };

    return res.render('crud-form', {
      ado,
      hiba: 'Minden kötelező mezőt ki kell tölteni.'
    });
  }

  if (id) {
    const existing = db.adok.find(a => a.id === parseInt(id, 10));
    if (existing) {
      existing.frekvencia = frekvencia;
      existing.teljesitmeny = teljesitmeny;
      existing.csatorna = csatorna;
      existing.cim = cim;
      existing.telepulesNev = telepulesNev;
      existing.megyeNev = megyeNev;
      existing.regioNev = regioNev;
    }
  } else {
    const newId = db.getNextAdoId();
    db.adok.push({
      id: newId,
      frekvencia,
      teljesitmeny,
      csatorna,
      cim,
      telepulesNev,
      megyeNev,
      regioNev
    });
  }

  res.redirect('/crud');
});

router.get('/delete/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = db.adok.findIndex(a => a.id === id);

  if (index !== -1) {
    db.adok.splice(index, 1);
  }

  res.redirect('/crud');
});

module.exports = router;
