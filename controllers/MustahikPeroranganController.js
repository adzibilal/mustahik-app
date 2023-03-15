const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const db = require('../db');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

module.exports = function (app) {
    function isUserAllowed(req, res, next) {
        sess = req.session;
        if (sess.user) {
            return next();
        } else {
            res.redirect('/login');
        }
    }

    // GET all data
    app.get('/mustahik-perorangan', isUserAllowed, (req, res) => {
        db.query('SELECT * FROM mustahik_perorangan', (err, results) => {
            if (err) throw err;
            const data = req.session; // Mendapatkan data session
            res.render('MustahikPerorangan/index', {
                title: 'Mustahik Perorangan',
                mustahik_perorangan: results,
                data: data.user,
                message: req.flash('message'),
                error: req.flash('error'),
                success: req.flash('success'),
            });
        });
    });

    // Tampilkan form tambah mustahik-perorangan
    app.get('/mustahik-perorangan/add', isUserAllowed, function (req, res) {
        const data = req.session; // Mendapatkan data session
        console.log('data', data);
        res.render('MustahikPerorangan/add', {
            title: 'Tambah Program',
            data: data.user,
            message: req.flash('message'),
            error: req.flash('error'),
            success: req.flash('success'),
        });
    });

    // POST add data
    app.post('/mustahik-perorangan/add', (req, res) => {
        const {
            fullname,
            ktp_number,
            tgl_lahir,
            tempat_lahir,
            had_kipayah,
            jumlah_tanggungan,
            penghasilan,
            gender,
            alamat,
            negara,
            provinsi,
            kota_kab,
            kec,
            kel_desa,
            status_menikah,
            jenis_mustahik,
            asnaf_mustahik,
        } = req.body;

        console.log('req.body', req.body)

        db.query(
            'INSERT INTO mustahik_perorangan (fullname, ktp_number, tgl_lahir, tempat_lahir, had_kipayah, jumlah_tanggungan, penghasilan, gender, alamat, negara, provinsi, kota_kab, kec, kel_desa, status_menikah, jenis_mustahik, asnaf_mustahik) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                fullname,
                ktp_number,
                tgl_lahir,
                tempat_lahir,
                had_kipayah,
                jumlah_tanggungan,
                penghasilan,
                gender,
                alamat,
                negara,
                provinsi,
                kota_kab,
                kec,
                kel_desa,
                status_menikah,
                jenis_mustahik,
                asnaf_mustahik,
            ],
            (err, result) => {
                if (err) throw err;
                req.flash('success', 'Tambah Mustahik Berhasil');
                res.redirect('/mustahik-perorangan');
            }
        );
    });

    // GET edit data
    app.get('/mustahik-perorangan/edit/:id', (req, res) => {
        const id = req.params.id;

        db.query(
            'SELECT * FROM mustahik_perorangan WHERE mustahik_perorangan_id = ?',
            [id],
            (err, result) => {
                if (err) throw err;
                const data = req.session; // Mendapatkan data session

                console.log('result', result);
                res.render('MustahikPerorangan/edit', {
                    title: 'Edit Mustahik Perorangan',
                    mustahik: result[0],
                    data: data.user,
                });
            }
        );
    });

    // POST update data
    app.post('/mustahik-perorangan/edit/:id', (req, res) => {
        const id = req.params.id;
        const {
            fullname,
            ktp_number,
            tgl_lahir,
            tempat_lahir,
            had_kipayah,
            jumlah_tanggungan,
            penghasilan,
            gender,
            alamat,
            negara,
            provinsi,
            kota_kab,
            kec,
            kel_desa,
            status_menikah,
            jenis_mustahik,
            asnaf_mustahik,
        } = req.body;

        db.query(
            'UPDATE mustahik_perorangan SET fullname = ?, ktp_number = ?, tgl_lahir = ?, tempat_lahir = ?, had_kipayah = ?, jumlah_tanggungan = ?, penghasilan = ?, gender = ?, alamat = ?, negara = ?, provinsi = ?, kota_kab = ?, kec = ?, kel_desa = ?, status_menikah = ?, jenis_mustahik = ?, asnaf_mustahik = ? WHERE mustahik_perorangan_id = ?',
            [
                fullname,
                ktp_number,
                tgl_lahir,
                tempat_lahir,
                had_kipayah,
                jumlah_tanggungan,
                penghasilan,
                gender,
                alamat,
                negara,
                provinsi,
                kota_kab,
                kec,
                kel_desa,
                status_menikah,
                jenis_mustahik,
                asnaf_mustahik,
                id,
            ],
            (err, result) => {
                if (err) throw err;
                req.flash('success', 'Update Mustahik Berhasil');
                res.redirect('/mustahik-perorangan');
            }
        );
    });

     // Hapus mustahik-perorangan
     app.post('/mustahik-perorangan/delete/:id', isUserAllowed, function (req, res) {
        const mustahikId = req.params.id;
        db.query(
            'DELETE FROM mustahik_perorangan WHERE mustahik_perorangan_id = ?',
            [mustahikId],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    req.flash('success', 'Hapus Mustahik Berhasil');
                    res.redirect('/mustahik-perorangan');
                }
            }
        );
    });
};
