import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import './css/movie.css';
import 'bootstrap';
import * as templates from './templates';
import {Period, Slot, pickSlots} from './utils.js';

// Gloabel Cache
const Theaters = {};

// utils =================
const unique = (value, idx, arr) => arr.indexOf(value) == idx;

function toArray(obj) {
    var array = [];
    // iterate backwards ensuring that length is an UInt32
    for (var i = obj.length >>> 0; i--;) {
        array[i] = obj[i];
    }
    return array;
}

const fetchJSON = async (url, method = 'GET') => {
    try {
        const response = await fetch(url, { method, credentials: 'same-origin' });
        return response.json();
    } catch (error) {
        return { error };
    }
};

const showAlert = (message, type = 'danger') => {
    const alertsElement = document.body.querySelector('.app-alerts');
    const html = templates.alert({type, message});
    alertsElement.insertAdjacentHTML('beforeend', html);
}

const listTheaters = async () => {
    const theaters = await fetchJSON('/api/list-theaters');
    const elem = document.body.querySelector('.app-theaters');
    elem.innerHTML = templates.listTheaters({theaters});
};

const getTheater = async(theaterId) => {
    let theater = Theaters[theaterId];
    if(!theater){
        theater = await fetchJSON(`/api/theater/${theaterId}`);
        theater.movies.forEach(movie => {
            movie.showtimes = movie.showtimes.map(begin => {
                const p = new Period(begin, begin + movie.len);
                p['picked'] = true;   //add flag to label if is picked.
                return p;
            });
        });
        //cache
        Theaters[theaterId] = theater;
    }
    //console.log(theater);
    return theater;
};

const setPeriodPickiness = function(periodElem){
    const [t, m, p]  = periodElem.getAttribute('data-period-id').split(':');
    Theaters[t].movies[m].showtimes[p].picked = periodElem.checked;
}

const syncMovieCheckbox = function (periodElem){
    const picks = toArray(periodElem.parentElement.querySelectorAll('input.period'))
        .map(el => (<HTMLInputElement>el).checked);
    const checked_picks = picks.filter(ck => ck);

    const mv = <HTMLInputElement>periodElem.parentElement.parentElement.querySelector('input.movie');
    if (!checked_picks.length) {
        mv.checked = false;
        mv.indeterminate = false;
    }
    else if (checked_picks.length === picks.length) {
        mv.checked = true;
        mv.indeterminate = false;
    }
    else {
        mv.indeterminate = true;
    }
};

const setPeriodsPickiness = function(movieElem)
{
    const periods = movieElem.parentElement.querySelectorAll('input.period');
    periods.forEach(pd => setPeriodPickiness(pd));
};

const syncPeriodCheckbox = function(movieElem)
{
    const periods = movieElem.parentElement.querySelectorAll('input.period');
    periods.forEach(pd => (<HTMLInputElement>pd).checked = movieElem.checked);
};

const showTheater = async (theaterId) => {
    const theater = await getTheater(theaterId);
    const elem = document.body.querySelector('.app-movies');
    elem.innerHTML = templates.listMovies({theater});

    // Pick/Unpick a period
    const periods = elem.querySelectorAll('.period');
    periods.forEach(period => {
        period.addEventListener('change', event => {
            syncMovieCheckbox(event.target);
            setPeriodPickiness(event.target);
            scheduling();
        });
    });

    // Change a movie's all periods
    const movies = elem.querySelectorAll('input.movie');
    movies.forEach(movie => {
        movie.addEventListener('change', event => {
            syncPeriodCheckbox(event.target);
            setPeriodsPickiness(event.target);
            scheduling();
        });
    });

    scheduling();
};

const genMovieSlots = function(theater){
    return theater.movies.map(movie => {
        return movie.showtimes.filter(period => period.picked)
                                .map(period => new Slot(movie.title, period));
    })
    .reduce((slots1, slots2) => slots1.concat(slots2))
    .sort((s1, s2) => s1.period.begin - s2.period.begin);
};

const listSchedules = function(scheds){
    //prepare drawing paramters
    if(scheds.length){
        const labels = getCurrTheater().movies.map(m => m.title);

        const [scale_sn, scale] = [5, 95];
        var span = new Period(Math.min(...scheds.map(s => s.begin)),
            Math.max(...scheds.map(s => s.end)));

        scheds.forEach(sched => {
            sched.slots.forEach(slot => {
                // TODO '0.8' and '9' is a temperary workaround for Boostrap Container
                slot['label_idx'] = labels.indexOf(slot.label);
                slot['left'] = 0.8 * (scale_sn + scale * (slot.begin - span.begin) / span.duration) + 9;
                slot['width'] = 0.8 * (scale * slot.duration / span.duration);
            });
        });
    }

    //show
    const schedElem = document.body.querySelector('.app-scheds');
    schedElem.innerHTML = templates.listSchedules({scheds});
};

const getCurrTheater = function(){
    const tid = document.body.querySelector('[data-theater-id]').getAttribute('data-theater-id');
    return Theaters[tid];
}

const scheduleSlots = function(slots)
{
    if(!slots.length)
        return [];
    
    const labels = slots.map(s=>s.label).filter(unique);
    console.log(`${labels.length} movies and ${slots.length} slots are picked.`);

    const span = new Period(slots[0].begin, Math.max(...slots.map(s=>s.end)));
    const scheds = pickSlots(span, slots)
                    .filter(sched => sched.slots.length == labels.length)  // strictly contains all movies
                    .sort((s1, s2) => s1.duration - s2.duration); // prefer short duration

    console.log(`There are ${scheds.length} schedules.`);
    //scheds.forEach(s => console.log(s.toString()));
    return scheds;
}

const scheduling = function(){
    const theater = getCurrTheater();
    const slots = genMovieSlots(theater);
    const scheds = scheduleSlots(slots);
    listSchedules(scheds);
}

const showView = async () => {
    const [view, ...params] = window.location.hash.split('/');
    switch(view){
        case '#list-theaters':
            await listTheaters();
            break;
        case '#view-theater':
            const theaterId = params[0];
            await showTheater(theaterId);
            break;
        default:
            throw Error(`Unrecognized view: ${view}`);
    }
};

// Page setup.
(async () => {
    document.body.innerHTML = templates.main();
    window.addEventListener('hashchange', showView);
    showView().catch(err => window.location.hash = '#list-theaters');
})();
