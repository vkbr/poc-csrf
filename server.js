const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const victimApp = express();
const hostApp = express();
const attacherApp = express();

const static = express.static(path.resolve('./static'));

const victimToken = Math.random().toString(36).substr(2);

const posts = [];

hostApp.use(static);
victimApp.use(static);
attacherApp.use(static);
victimApp.use(cookieParser());
victimApp.use(tokenMiddleware);

function tokenMiddleware(req, res, next) {
  console.log(req.method);
  if (req.method === 'POST' && req.cookies.token !== victimToken) {
    res.status(403).send('Unauthorize');
  } else {
    next();
  }
};

victimApp.post('/unsecured-form-submit', [express.urlencoded()], (req, res) => {
  posts.push(req.body);
  res.send('Success');
});

victimApp.get('/posts', (req, res) => res.json({ posts }));

victimApp.get('*', (req, res) => {
  console.log(`Token ${victimToken}`);
  res.setHeader('Content-type', 'text/html');
  res.cookie('token', victimToken, {
    expires: new Date(Date.now() + (366*24*3600*1000)),
  });
  res.sendFile(path.resolve('./index.victim.html'));
});

attacherApp.get('*', (req, res) => {
  res.setHeader('Content-type', 'text/html');
  res.sendFile(path.resolve('./index.attacker.html'));
});

hostApp.get('*', (req, res) => {
  res.setHeader('Content-type', 'text/html');
  res.sendFile(path.resolve('./index.host.html'));
});

hostApp.listen(3000, (err) => {
  if (err) {
    console.error('[HOST]', err);
  } else {
    console.log('[HOST]:3000');
  }
});

victimApp.listen(3001, (err) => {
  if (err) {
    console.error('[VICTIM]', err);
  } else {
    console.log('[VICTIM]:3001');
  }
});

attacherApp.listen(3002, (err) => {
  if (err) {
    console.error('[ATTACKER]', err);
  } else {
    console.error('[ATTACKER]: 3002');
  }
});
