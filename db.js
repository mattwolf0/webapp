const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

function loadLines(filename) {
  const fullPath = path.join(dataDir, filename);
  if (!fs.existsSync(fullPath)) {
    return [];
  }
  return fs
    .readFileSync(fullPath, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
}

let regiok = [];
let telepulesek = [];
let adok = [];

let nextAdoId = 1;

function initRadioData() {
  const regioLines = loadLines('regio.txt');
  const teleLines = loadLines('telepules.txt');
  const kiosztasLines = loadLines('kiosztas.txt');

  regiok = regioLines.map(line => {
    const p = line.split(';');
    return {
      megyeId: parseInt(p[0], 10),
      megyeNev: p[1] || '',
      regioNev: p[2] || ''
    };
  });

  telepulesek = teleLines.map(line => {
    const p = line.split(';');
    return {
      id: parseInt(p[0], 10),
      nev: p[1] || '',
      megyeId: parseInt(p[2], 10)
    };
  });

  const megyeById = {};
  regiok.forEach(r => {
    if (!isNaN(r.megyeId)) {
      megyeById[r.megyeId] = r;
    }
  });

  const teleById = {};
  telepulesek.forEach(t => {
    if (!isNaN(t.id)) {
      teleById[t.id] = t;
    }
  });

  adok = [];
  let idCounter = 1;

  kiosztasLines.forEach(line => {
    const p = line.split(';').map(x => x.trim());

    if (p.length === 0) return;


    const frekvencia = p[0] || '';
    const teljesitmeny = p.length > 1 ? p[1] : '';
    const csatorna = p.length > 2 ? p[2] : '';
    const cim = p.length > 3 ? p[3] : '';
    const telepulesIdRaw = p.length > 4 ? p[4] : '';

    let telepulesId = parseInt(telepulesIdRaw, 10);
    if (isNaN(telepulesId)) {
      telepulesId = null;
    }

    const tele = telepulesId != null ? teleById[telepulesId] : null;
    const megye = tele ? megyeById[tele.megyeId] : null;

    adok.push({
      id: idCounter++,
      frekvencia,
      teljesitmeny,
      csatorna,
      cim,
      telepulesId,
      telepulesNev: tele ? tele.nev : '',
      megyeNev: megye ? megye.megyeNev : '',
      regioNev: megye ? megye.regioNev : ''
    });
  });

  nextAdoId = idCounter;
}

const users = [
  { id: 1, username: 'admin', email: 'admin@example.com', password: 'admin', role: 'admin' }
];

let nextUserId = 2;

const uzenetek = [];
let nextUzenetId = 1;

function getNextUserId() {
  return nextUserId++;
}

function getNextUzenetId() {
  return nextUzenetId++;
}

function getNextAdoId() {
  return nextAdoId++;
}

initRadioData();

module.exports = {
  users,
  uzenetek,
  adok,
  telepulesek,
  regiok,
  getNextUserId,
  getNextUzenetId,
  getNextAdoId
};
