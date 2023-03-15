const express = require('express');
const bodyParser = require('body-parser');
const app = express();

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
                const data = req.session; // Mendapatkan data session
                res.render('Program/index', {
                    programs: result,
                    title: 'Master Program',
                    data: data.user,
                    message: req.flash('message'),
                    error: req.flash('error'),
                    success: req.flash('success'),
                });
            }
        });
    });

    // Tampilkan form tambah program
    app.get('/program/add', isUserAllowed, function (req, res) {
        const data = req.session; // Mendapatkan data session
        console.log('data', data);
        res.render('Program/add', {
            title: 'Tambah Program',
            data: data.user,
            message: req.flash('message'),
            error: req.flash('error'),
            success: req.flash('success'),
        });
    });

    // Proses tambah program
    app.post('/program/add', isUserAllowed, function (req, res) {
        const { program_name, program_category } = req.body;
        console.log('req.body', req.body);
        console.log('name', program_name);
        console.log('category', program_category);
        db.query(
            'INSERT INTO master_program (program_name, program_category) VALUES (?, ?)',
            [program_name, program_category],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    req.flash('success', 'Tambah Program Berhasil');
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
                    const data = req.session; // Mendapatkan data session
                    res.render('Program/edit', {
                        title: 'Edit Program',
                        data: data.user,
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
                    req.flash('success', 'Edit Program Berhasil');
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
                    req.flash('success', 'Hapus Program Berhasil');
                    res.redirect('/program');
                }
            }
        );
    });
};
