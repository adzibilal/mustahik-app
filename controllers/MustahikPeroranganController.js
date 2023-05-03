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

    app.get('/getKotaByProvinsi/:id', function (req, res) {
        var idProvinsi = req.params.id;
        db.query(
            'select * from loc_kota WHERE province_id = ?',
            [idProvinsi],
            (err, result) => {
                if (err) console.error(err);
                // console.log('result', result)
                res.json(result);
            }
        ); //contoh fungsi untuk mengambil data kota
        // res.json(kota);
    });
    app.get('/getKecByKota/:id', function (req, res) {
        var idKota = req.params.id;
        db.query(
            'select * from loc_kec WHERE regency_id = ?',
            [idKota],
            (err, result) => {
                if (err) console.error(err);
                // console.log('result', result)
                res.json(result);
            }
        ); //contoh fungsi untuk mengambil data kota
        // res.json(kota);
    });
    app.get('/getDesaByKec/:id', function (req, res) {
        var idKec = req.params.id;
        db.query(
            'select * from loc_desa WHERE district_id = ?',
            [idKec],
            (err, result) => {
                if (err) console.error(err);
                // console.log('result', result)
                res.json(result);
            }
        ); //contoh fungsi untuk mengambil data kota
        // res.json(kota);
    });

    // GET all data
    app.get('/mustahik-perorangan', isUserAllowed, (req, res) => {
        db.query(
            `select
        mp.mustahik_perorangan_id as mustahik_id,
        concat('MUS-',DATE_FORMAT(created_at,'%Y%m%d'),'-',mp.mustahik_perorangan_id) as ID_Mustahik,
        fullname as nama,
        ktp_number as no_ktp,
        tgl_lahir as tanggal_lahir,
        gender as jenis_kelamin,
        concat(kota_kab,', ',kec) as lokasi,
        status_menikah as status,
        asnaf_mustahik as asnaf,
        jenis_mustahik,
        alamat,
        kel_desa as kel,
        kec,
        kota_kab,
        url_photo,
        url_ktp_file,
        url_kk_file,
        url_sktm_file,
        url_docs_lain,
        concat(
            fullname, ' | ',     concat('MUS-',DATE_FORMAT(created_at,'%Y%m%d'),'-',mp.mustahik_perorangan_id),' | ',
            ' NIK : ' , case when ktp_number is not null then ktp_number else 0 end, ' | ',
            concat(kota_kab,', ',kec)
            ) as pencarian_mustahik
    from db_mustahik_app.mustahik_perorangan mp;`,
            (err, results) => {
                if (err) console.error(err);
                const data = req.session; // Mendapatkan data session
                // console.error(results);
                res.render('MustahikPerorangan/index', {
                    title: 'Mustahik Perorangan',
                    mustahik_perorangan: results,
                    data: data.user,
                    message: req.flash('message'),
                    error: req.flash('error'),
                    success: req.flash('success'),
                });
            }
        );
    });

    // Tampilkan form tambah mustahik-perorangan
    app.get('/mustahik-perorangan/add', isUserAllowed, function (req, res) {
        const data = req.session; // Mendapatkan data session
        console.log('data', data);

        db.query('select * from loc_provinsi', (err, rows, fields) => {
            if (err) console.error(err);

            const provinsi = rows;
            res.render('MustahikPerorangan/add', {
                title: 'Tambah Program',
                data: data.user,
                provinsi: provinsi,
                message: req.flash('message'),
                error: req.flash('error'),
                success: req.flash('success'),
            });
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
            wsantunan,
        } = req.body;

        console.log('wsantunan', wsantunan);

        const newHad = had_kipayah.replace(/\./g, '').replace(/Rp\s|,/g, '');
        const finalHad = Number(newHad.slice(0, -2));
        console.log('Had', finalHad);
        const newPenghasilan = penghasilan
            .replace(/\./g, '')
            .replace(/Rp\s|,/g, '');
        const finalPenghasilan = Number(newPenghasilan.slice(0, -2));
        console.log('Penghasilan', finalPenghasilan);

        db.query(
            'INSERT INTO mustahik_perorangan (fullname, ktp_number, tgl_lahir, tempat_lahir, had_kipayah, jumlah_tanggungan, penghasilan, gender, alamat, negara, provinsi, kota_kab, kec, kel_desa, status_menikah, jenis_mustahik, asnaf_mustahik) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                fullname,
                ktp_number,
                tgl_lahir,
                tempat_lahir,
                finalHad,
                jumlah_tanggungan,
                finalPenghasilan,
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
                if (err) console.error(err);
                if (wsantunan === '0') {
                    req.flash('success', 'Tambah Mustahik Berhasil');
                    res.redirect('/mustahik-perorangan');
                } else {
                    console.error('result', result);
                    res.redirect('/santunan/add_santunan/' + result.insertId);
                }
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
                if (err) console.error(err);
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
                if (err) console.error(err);
                req.flash('success', 'Update Mustahik Berhasil');
                res.redirect('/mustahik-perorangan');
            }
        );
    });

    // Hapus mustahik-perorangan
    app.post(
        '/mustahik-perorangan/delete/:id',
        isUserAllowed,
        function (req, res) {
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
        }
    );
};
