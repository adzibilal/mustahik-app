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

    app.get('/santunan', isUserAllowed, function (req, res) {
        db.query(
            `select
            concat('S','-',DATE_FORMAT(s.created_at,'%Y%m%d'),'-',s.santunan_id) as santunan_id,
            date(s.created_at) as tgl_santunan,
            concat('MUS-',DATE_FORMAT(mp.created_at,'%Y%m%d'),'-',s.mustahik_id) as mustahik_id,
            mp.ktp_number as KTP,
            mp.fullname as mustahik,
            p.program_name,
            p.program_category,
            s.nominal
           from santunan_perorangan s
           join master_program p on s.program_id = p.program_id
           left join mustahik_perorangan mp on s.mustahik_id = mp.mustahik_perorangan_id;
        `,
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    console.log('result', result)
                    const data = req.session; // Mendapatkan data session
                    res.render('Santunan/index', {
                        santunan: result,
                        title: 'Data Santunan Perorangan',
                        data: data.user,
                        message: req.flash('message'),
                        error: req.flash('error'),
                        success: req.flash('success'),
                    });
                }
            }
        );
    });

    app.get('/santunan/add', isUserAllowed, function (req, res) {
        const data = req.session; // Mendapatkan data session

        // Mengambil data mustahik dari database
        db.query(
            'select mustahik_id, pencarian_mustahik from db_mustahik_app.view_mustahik_all',
            function (err, rows, fields) {
                if (err) console.log(err);

                const mustahik = rows;

                // Mengambil data program dari database
                db.query(
                    'SELECT * FROM master_program',
                    function (err, rows, fields) {
                        if (err) console.log(err);

                        const program = rows;

                        // Render halaman dengan data mustahik dan program yang telah diambil
                        res.render('Santunan/add', {
                            title: 'Tambah Santunan Perorangan',
                            data: data.user,
                            mustahik: mustahik, // Menambahkan variabel mustahik yang berisi data mustahik dari database
                            program: program, // Menambahkan variabel program yang berisi data program dari database
                            message: req.flash('message'),
                            error: req.flash('error'),
                            success: req.flash('success'),
                        });
                    }
                );
            }
        );
    });
    app.get(
        '/santunan/add_santunan/:mustahik_id',
        isUserAllowed,
        function (req, res) {
            const { mustahik_id } = req.params;
            const data = req.session; // Mendapatkan data session

            // Mengambil data mustahik dari database
            db.query(
                'select mustahik_id, pencarian_mustahik from db_mustahik_app.view_mustahik_all',
                function (err, rows, fields) {
                    if (err) console.log(err);

                    const mustahik = rows;

                    // Mengambil data program dari database
                    db.query(
                        'SELECT * FROM master_program',
                        function (err, rows, fields) {
                            if (err) console.log(err);

                            const program = rows;

                            // Render halaman dengan data mustahik dan program yang telah diambil
                            res.render('Santunan/add_santunan', {
                                title: 'Tambah Santunan Perorangan',
                                data: data.user,
                                selected_id: mustahik_id,
                                mustahik: mustahik, // Menambahkan variabel mustahik yang berisi data mustahik dari database
                                program: program, // Menambahkan variabel program yang berisi data program dari database
                                message: req.flash('message'),
                                error: req.flash('error'),
                                success: req.flash('success'),
                            });
                        }
                    );
                }
            );
        }
    );

    // Proses tambah santunan
    app.post('/santunan/add', isUserAllowed, function (req, res) {
        const { mustahik_id, program_id, nominal, date } = req.body;
        // console.log('req.body', req.body);
        // console.log('mustahik_id', mustahik_id);
        // console.log('program_id', program_id);
        const newNominal = nominal.replace(/\./g, '').replace(/Rp\s|,/g, '');

        const finalNominal = Number(newNominal.slice(0, -2));
        console.log('nominal', finalNominal);
        db.query(
            'INSERT INTO santunan_perorangan (mustahik_id, program_id, nominal, created_at) VALUES (?, ?, ?, ?)',
            [mustahik_id, program_id, finalNominal, date],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    req.flash('success', 'Tambah Santunan Berhasil');
                    res.redirect('/santunan');
                }
            }
        );
    });

    app.get('/santunan/edit/:santunan_id', isUserAllowed, function (req, res) {
        const { santunan_id } = req.params;
        db.query(
            'SELECT s.*, m.fullname , p.program_name FROM santunan_perorangan s JOIN mustahik_perorangan m ON s.mustahik_id = m.mustahik_perorangan_id JOIN master_program p ON s.program_id = p.program_id WHERE s.santunan_id = ?',
            [santunan_id],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    const data = req.session; // Mendapatkan data session

                    // Mengambil data mustahik dari database
                    db.query(
                        'SELECT * FROM mustahik_perorangan',
                        function (err, rows, fields) {
                            if (err) console.log(err);

                            const mustahik = rows;

                            // Mengambil data program dari database
                            db.query(
                                'SELECT * FROM master_program',
                                function (err, rows, fields) {
                                    if (err) console.log(err);

                                    const program = rows;
                                    const data = req.session; // Mendapatkan data session

                                    // Render halaman dengan data santunan, mustahik, dan program yang telah diambil
                                    res.render('Santunan/edit', {
                                        santunan: result[0],
                                        title: 'Edit Santunan Perorangan',
                                        data: data.user,
                                        mustahik: mustahik, // Menambahkan variabel mustahik yang berisi data mustahik dari database
                                        program: program, // Menambahkan variabel program yang berisi data program dari database
                                        message: req.flash('message'),
                                        error: req.flash('error'),
                                        success: req.flash('success'),
                                    });
                                }
                            );
                        }
                    );
                }
            }
        );
    });

    // Proses edit santunan
    app.post('/santunan/edit/:santunan_id', isUserAllowed, function (req, res) {
        const { santunan_id } = req.params;
        const { mustahik_id, program_id, nominal } = req.body;
        db.query(
            'UPDATE santunan_perorangan SET mustahik_id = ?, program_id = ?, nominal = ? WHERE santunan_id = ?',
            [mustahik_id, program_id, nominal, santunan_id],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    req.flash('success', 'Edit Santunan Berhasil');
                    res.redirect('/santunan');
                }
            }
        );
    });

    // Proses hapus santunan
    app.post(
        '/santunan/delete/:santunan_id',
        isUserAllowed,
        function (req, res) {
            const { santunan_id } = req.params;
            db.query(
                'DELETE FROM santunan_perorangan WHERE santunan_id = ?',
                [santunan_id],
                (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        req.flash('success', 'Hapus Santunan Berhasil');
                        res.redirect('/santunan');
                    }
                }
            );
        }
    );
};
