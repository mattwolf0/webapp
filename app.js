const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

const BASE_PATH = '/app013';
app.locals.basePath = BASE_PATH;

const pageRoutes = require('./routes/pages');
const crudRoutes = require('./routes/crud');
const authRoutes = require('./routes/auth');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'valami titok',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/', authRoutes);
app.use('/', pageRoutes);
app.use('/crud', crudRoutes);

app.use(BASE_PATH, authRoutes);
app.use(BASE_PATH, pageRoutes);
app.use(BASE_PATH + '/crud', crudRoutes);

module.exports = app;
