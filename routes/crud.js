const express = require('express');
const router = express.Router();
const db = require('../db');

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

router.get('/', (req, res) => {
  res.render('crud', {
    adok: db.adok,
    message: null
  });
});

router.get('/new', requireLogin, (req, res) => {
  res.render('crud-form', {
    ado: null,
    hiba: null,
    telepulesek: db.telepulesek || []
  });
});

router.get('/edit/:id', requireLogin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ado = db.adok.find(a => a.id === id) || null;

  if (!ado) {
    return res.status(404).send('Nem található ilyen rádióadó');
  }

  res.render('crud-form', {
    ado,
    hiba: null,
    telepulesek: db.telepulesek || []
  });
});

router.post('/save', requireLogin, (req, res) => {
  const { id, frekvencia, teljesitmeny, csatorna, cim, telepulesId } = req.body;

  if (!frekvencia || !teljesitmeny || !csatorna || !cim || !telepulesId) {
    const ado = id
      ? db.adok.find(a => a.id === parseInt(id, 10)) || null
      : null;

    return res.render('crud-form', {
      ado,
      hiba: 'Minden mező kötelező.',
      telepulesek: db.telepulesek || []
    });
  }

  const teleId = parseInt(telepulesId, 10);
  const tele = db.telepulesek.find(t => t.id === teleId) || null;

  const frek = String(frekvencia).trim();
  const telj = String(teljesitmeny).trim();
  const csat = String(csatorna).trim();
  const cimStr = String(cim).trim();

  if (id) {
    const ado = db.adok.find(a => a.id === parseInt(id, 10));

    if (!ado) {
      return res.status(404).send('Nem található ilyen rádióadó');
    }

    ado.frekvencia = frek;
    ado.teljesitmeny = telj;
    ado.csatorna = csat;
    ado.cim = cimStr;
    ado.telepulesId = tele ? tele.id : null;
    ado.telepulesNev = tele ? tele.nev : '';
    ado.megyeNev = tele ? tele.megyeNev : '';
    ado.regioNev = tele ? tele.regioNev : '';
  } else {
    const newId = db.getNextAdoId();

    db.adok.push({
      id: newId,
      frekvencia: frek,
      teljesitmeny: telj,
      csatorna: csat,
      cim: cimStr,
      telepulesId: tele ? tele.id : null,
      telepulesNev: tele ? tele.nev : '',
      megyeNev: tele ? tele.megyeNev : '',
      regioNev: tele ? tele.regioNev : ''
    });
  }

  res.redirect('/crud');
});

router.get('/delete/:id', requireLogin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = db.adok.findIndex(a => a.id === id);

  if (index !== -1) {
    db.adok.splice(index, 1);
  }

  res.redirect('/crud');
});

module.exports = router;
