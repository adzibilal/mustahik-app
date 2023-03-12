var app = require('express')();

var express = require('express');
var path = require('path');
var http = require('http').Server(app);
var validator = require('express-validator');
require('dotenv').config();
// import controller
var AuthController = require('./controllers/AuthController');
var ProgramController = require('./controllers/ProgramController');
var MustahikPeroranganController = require('./controllers/MustahikPeroranganController');

// import Router file
var pageRouter = require('./routers/route');

var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var i18n = require("i18n-express");
app.use(bodyParser.json());
var urlencodeParser = bodyParser.urlencoded({ extended: true });
const db = require('./db');


app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 1200000
  }
}));

app.use(session({ resave: false, saveUninitialized: true, secret: 'nodedemo' }));
app.use(flash());
app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'), // <--- use here. Specify translations files path.
  siteLangs: ["es", "en", "de", "ru", "it", "fr"],
  textsVarName: 'translation'
}));


app.use('/public', express.static('public'));
app.use('/program/public', express.static('public'));
app.use('/program/edit/public', express.static('public'));
app.use('/mustahik-perorangan/public', express.static('public'));
app.use('/mustahik-perorangan/edit/public', express.static('public'));


// app.use(express.static(__dirname + '/public'))

app.get('/layouts/', function (req, res) {
  res.render('view');
});

// apply controller
AuthController(app);


//For set layouts of html view
var expressLayouts = require('express-ejs-layouts');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(urlencodeParser)
// Define All Route 
pageRouter(app);

ProgramController(app);
MustahikPeroranganController(app);

app.get('/', function (req, res) {
  res.redirect('/');
});



http.listen(8000, function () {
  console.log('listening on *:8000');
});
