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
    app.post(
        '/mustahik-perorangan/add',
        upload.fields([
            { name: 'url_photo', maxCount: 1 },
            { name: 'url_ktp_file', maxCount: 1 },
            { name: 'url_kk_file', maxCount: 1 },
            { name: 'url_sktm_file', maxCount: 1 },
            { name: 'url_docs_lain', maxCount: 10 },
        ]),
        (req, res) => {
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

            const {
                url_photo,
                url_ktp_file,
                url_kk_file,
                url_sktm_file,
                url_docs_lain,
            } = req.files;

            db.query(
                'INSERT INTO mustahik_perorangan (fullname, ktp_number, tgl_lahir, tempat_lahir, had_kipayah, jumlah_tanggungan, penghasilan, gender, alamat, negara, provinsi, kota_kab, kec, kel_desa, status_menikah, jenis_mustahik, asnaf_mustahik, url_photo, url_ktp_file, url_kk_file, url_sktm_file, url_docs_lain) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
                    url_photo[0].filename,
                    url_ktp_file[0].filename,
                    url_kk_file[0].filename,
                    url_sktm_file[0].filename,
                    JSON.stringify(url_docs_lain.map((file) => file.filename)),
                ],
                (err, result) => {
                    if (err) throw err;
                    req.flash('success', 'Tambah Mustahik Berhasil');
                    res.redirect('/mustahik-perorangan');
                }
            );
        }
    );
};
