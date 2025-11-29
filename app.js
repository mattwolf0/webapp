const express = require('express');
const path = require('path');
const session = require('express-session');

const pagesRouter = require('./routes/pages');
const authRouter = require('./routes/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'valami_titok',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/', pagesRouter);
app.use('/', authRouter);

module.exports = app;
