var express = require('express');
var bodyParser = require('body-parser');
const db = require('../db');

module.exports = function (app) {
    function isUserAllowed(req, res, next) {
        sess = req.session;
        if (sess.user) {
            return next();
        } else {
            res.redirect('/login');
        }
    }
    // Tampilkan semua program
    app.get('/program', isUserAllowed, function (req, res) {
        db.query('SELECT * FROM master_program', (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('Program/index', {
                    programs: result,
                    title: 'Master Program',
                });
            }
        });
    });

    // Tampilkan form tambah program
    app.get('/program/add', isUserAllowed, function (req, res) {
        res.render('Program/add', { title: 'Tambah Program' });
    });

    // Proses tambah program
    app.post('/program/add', isUserAllowed, function (req, res) {
        const { program_name, program_category } = req.body;
        db.query(
            'INSERT INTO master_program (program_name, program_category) VALUES (?, ?)',
            [program_name, program_category],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.redirect('/program');
                }
            }
        );
    });

    // Tampilkan form edit program
    app.get('/program/edit/:id', isUserAllowed, function (req, res) {
        const programId = req.params.id;
        db.query(
            'SELECT * FROM master_program WHERE program_id = ?',
            [programId],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('Program/edit', {
                        title: 'Edit Program',
                        program: result[0],
                    });
                }
            }
        );
    });

    // Proses edit program
    app.post('/program/edit/:id', isUserAllowed, function (req, res) {
        const programId = req.params.id;
        const { program_name, program_category } = req.body;
        db.query(
            'UPDATE master_program SET program_name = ?, program_category = ? WHERE program_id = ?',
            [program_name, program_category, programId],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.redirect('/program');
                }
            }
        );
    });

    // Hapus program
    app.post('/program/delete/:id', isUserAllowed, function (req, res) {
        const programId = req.params.id;
        db.query(
            'DELETE FROM master_program WHERE program_id = ?',
            [programId],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.redirect('/program');
                }
            }
        );
    });
};
