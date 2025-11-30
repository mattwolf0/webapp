const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

function loadLines(filename) {
  const fullPath = path.join(dataDir, filename);
  if (!fs.existsSync(fullPath)) {
    console.warn('Hiányzó adatfájl:', fullPath);
    return [];
  }

  return fs.readFileSync(fullPath, 'utf8')
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

  const cleanRegio = regioLines[0] && regioLines[0].toLowerCase().startsWith('nev')
    ? regioLines.slice(1)
    : regioLines;

  const cleanTele = teleLines[0] && teleLines[0].toLowerCase().startsWith('nev')
    ? teleLines.slice(1)
    : teleLines;

  const cleanKiosztas = kiosztasLines[0] && kiosztasLines[0].toLowerCase().startsWith('frekvencia')
    ? kiosztasLines.slice(1)
    : kiosztasLines;

  regiok = cleanRegio.map(line => {
    const [regioNevRaw, megyeNevRaw] = line.split('\t');
    return {
      regioNev: (regioNevRaw || '').trim(),
      megyeNev: (megyeNevRaw || '').trim()
    };
  });

  telepulesek = cleanTele.map((line, idx) => {
    const [nevRaw, megyeNevRaw] = line.split('\t');
    const megyeNev = (megyeNevRaw || '').trim();
    const regioObj = regiok.find(r => r.megyeNev === megyeNev) || null;

    return {
      id: idx + 1,
      nev: (nevRaw || '').trim(),
      megyeNev,
      regioNev: regioObj ? regioObj.regioNev : ''
    };
  });

  const teleByName = {};
  telepulesek.forEach(t => {
    if (t.nev) {
      teleByName[t.nev] = t;
    }
  });

  adok = [];
  let idCounter = 1;

  cleanKiosztas.forEach(line => {
    if (!line) return;

    const [freqRaw, teljRaw, csatornaRaw, adohelyRaw, cimRaw] = line.split('\t');

    const frekvencia    = (freqRaw || '').trim();
    const teljesitmeny  = (teljRaw || '').trim();
    const csatorna      = (csatornaRaw || '').trim();
    const adohely       = (adohelyRaw || '').trim();
    const cim           = (cimRaw || '').trim();

    const tele = teleByName[adohely] || null;

    adok.push({
      id: idCounter++,
      frekvencia,
      teljesitmeny,
      csatorna,
      cim,
      telepulesId: tele ? tele.id : null,
      telepulesNev: tele ? tele.nev : adohely,
      megyeNev: tele ? tele.megyeNev : '',
      regioNev: tele ? tele.regioNev : ''
    });
  });

  nextAdoId = idCounter;
}

const usersFile = path.join(dataDir, 'users.json');
const uzenetekFile = path.join(dataDir, 'uzenetek.json');

let users = [];
let uzenetek = [];
let nextUserId = 1;
let nextUzenetId = 1;

function loadJson(fullPath, fallback) {
  if (!fs.existsSync(fullPath)) {
    return fallback;
  }
  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Hiba JSON betöltésekor:', fullPath, err);
    return fallback;
  }
}

function saveJson(fullPath, data) {
  try {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Hiba JSON mentésekor:', fullPath, err);
  }
}

function initUsers() {
  const stored = loadJson(usersFile, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    users = stored;
  } else {
    users = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin',
        role: 'admin'
      }
    ];
    saveJson(usersFile, users);
  }
  nextUserId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
}

function initUzenetek() {
  const stored = loadJson(uzenetekFile, []);
  uzenetek = Array.isArray(stored) ? stored : [];
  nextUzenetId = uzenetek.reduce((max, u) => Math.max(max, u.id), 0) + 1;
}

function getNextUserId() {
  return nextUserId++;
}

function getNextUzenetId() {
  return nextUzenetId++;
}

function getNextAdoId() {
  return nextAdoId++;
}

function saveUsers() {
  saveJson(usersFile, users);
}

function saveUzenetek() {
  saveJson(uzenetekFile, uzenetek);
}


initRadioData();
initUsers();
initUzenetek();

module.exports = {
  users,
  uzenetek,
  adok,
  telepulesek,
  regiok,
  getNextUserId,
  getNextUzenetId,
  getNextAdoId,
  saveUsers,
  saveUzenetek
};
