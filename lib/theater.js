'use strict';
const express = require('express');
const rp = require('request-promise');
const fs = require('fs');
const {URL} = require('url');
const theaters = require('../theaters.json');
const cheerio = require('cheerio');
//const {strToMinutes} = require('/utils.js');

const strToMinutes = (str) => {
    const tokens = (str.indexOf(':') >= 0) ?
        str.split(':') :
        str.split('：');

    const [h, m] = tokens;
    return Number(h) * 60 + Number(m);
}

module.exports = () => {
    const router = express.Router();

    router.get('/list-theaters', async (req, res) => {
        try{
            const id_names = Object.keys(theaters).map(id => ({id, name: theaters[id].name}));
            res.status(200).json(id_names);
        }
        catch(err){
            console.log(`ERROR list-theaters error: ${err}`);
            res.status(err.statusCode || 502).json(err.error || err);
        }
    });


    const parseMovie = (movie) => {
        const film = movie.find('.filmTitle>a');
        const title = film.text();
        const link = film.attr('href');

        const len_str = movie.find('img')[1].next.data;
        const pos = len_str.lastIndexOf('：') + 1;
        const len = Number(len_str.substr(pos, len_str.length - pos - 1));

        const showtimes = movie.find('.filmVersion').siblings().get()
                            .slice(0, -1)
                            .map(el => strToMinutes(el.children[0].data))
                            .map(min => min < 6*60? min + 24*60: min);   //is next day?

        return {title, link, len, showtimes};
    };

    router.get('/theater/:id', async (req, res) => {
        try{
            const id = req.params.id;
            const url = new URL(theaters[id].url);

            const data = await rp(url.href);
            //const data = fs.readFileSync(`./web/theaters/${id}.html`, 'utf8');
            const $ = cheerio.load(data, {decodeEntities: false});

            //const name = $('h2').html();
            const name = theaters[id].name;
            const date = $('h3').html().trim();
            const movies = $('#theaterShowtimeTable').map((idx, elem) => {
                let movie = parseMovie($(elem));
                movie.link = new URL(movie.link, url.origin).href;  //prefix origin
                return movie;
            }).get();

            res.status(200).json({id, name, date, movies});
        }
        catch(err){
            console.log(`ERROR list-theaters error: ${err}`);
            res.status(err.statusCode || 502).json(err.error || err);
        }
    });

    router.get('/view')

    return router;
};