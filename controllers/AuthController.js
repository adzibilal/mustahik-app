var express = require('express');
var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });

var validator = require('express-validator');

var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");

const crypto = require('crypto');
const db = require('../db');

// This sets the mock adapter on the default instance
var mock = new MockAdapter(axios);

let users = [
	{ id: 1, username: 'admin', password: '123456', email: 'admin@themesbrand.com' }
];

// Mock GET request to /users when param `searchText` is 'John'
mock.onGet("/users", { params: { searchText: "John" } }).reply(200, {
	users: users,
});

module.exports = function (app) {

	// Inner Auth
	app.get('/pages-login', function (req, res) {
		res.locals = { title: 'Login 1' };
		res.render('AuthInner/pages-login');
	});
	app.get('/pages-register', function (req, res) {
		res.locals = { title: 'Register 1' };
		res.render('AuthInner/pages-register');
	});
	app.get('/pages-recoverpw', function (req, res) {
		res.locals = { title: 'Recover Password 1' };
		res.render('AuthInner/pages-recoverpw');
	});
	app.get('/pages-lock-screen', function (req, res) {
		res.locals = { title: 'Lock Screen 1' };
		res.render('AuthInner/pages-lock-screen');
	});

	// Extra Pages

	app.get('/pages-404', function (req, res) {
		res.locals = { title: 'Error 404' };
		res.render('Pages/pages-404');
	});
	app.get('/pages-500', function (req, res) {
		res.locals = { title: 'Error 500' };
		res.render('Pages/pages-500');
	});
	app.get('/pages-comingsoon', function (req, res) {
		res.locals = { title: 'Coming Soon' };
		res.render('Pages/pages-comingsoon');
	});
	app.get('/pages-maintenance', function (req, res) {
		res.locals = { title: 'Maintenance' };
		res.render('Pages/pages-maintenance');
  });



	app.get('/register', function (req, res) {
		if (req.user) { res.redirect('Dashboard/index'); }
		else {
			res.render('Auth/auth-register', { 'message': req.flash('message'), 'error': req.flash('error') });
		}
	});

	app.post('/post-register', urlencodeParser, function (req, res) {
		let tempUser = { username: req.body.username, email: req.body.email, password: req.body.password };
		users.push(tempUser);

		// Assign value in session
		sess = req.session;
		sess.user = tempUser;

		res.redirect('/');
	});


	app.get('/login', function (req, res) {
		res.render('Auth/auth-login', { 'message': req.flash('message'), 'error': req.flash('error') });
	});

	app.post('/post-login', urlencodeParser, function (req, res) {
		const username = req.body.username
		const password = req.body.password

		// Enkripsi password menggunakan MD5
		const md5 = crypto.createHash('md5');
		const hashedPassword = md5.update(password).digest('hex');
	  
		console.log(hashedPassword)
		// Lakukan query untuk memeriksa username dan password di dalam tabel users
		const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${hashedPassword}'`;
		db.query(query, (err, result) => {
		  if (err) {
			callback(err, null);
			return;
		  }
		  if (result.length > 0) {
			// Jika username dan password benar, kembalikan data pengguna
			// Assign value in session
			sess = req.session;
			sess.user = result;

			res.redirect('/');
		  } else {
			// Jika username atau password salah, kembalikan pesan error
			req.flash('error', 'Username atau Password Salah!');
			res.redirect('/login');
		  }
		});
		// if (validUser['length'] === 1) {

		// 	// Assign value in session
		// 	sess = req.session;
		// 	sess.user = validUser;

		// 	res.redirect('/');

		// } else {
		// 	req.flash('error', 'Incorrect email or password!');
		// 	res.redirect('/login');
		// }
	});

	app.get('/forgot-password', function (req, res) {
		res.render('Auth/auth-forgot-password', { 'message': req.flash('message'), 'error': req.flash('error') });
	});

	app.post('/post-forgot-password', urlencodeParser, function (req, res) {
		const validUser = users.filter(usr => usr.email === req.body.email);
		if (validUser['length'] === 1) {
			req.flash('message', 'We have e-mailed your password reset link!');
			res.redirect('/forgot-password');
		} else {
			req.flash('error', 'Email Not Found !!');
			res.redirect('/forgot-password');
		}
	});

	app.get('/logout', function (req, res) {

		// Assign  null value in session
		sess = req.session;
		sess.user = null;

		res.redirect('/login');
	});


};