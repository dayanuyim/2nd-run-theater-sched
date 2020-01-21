import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';
//import '../node_modules/css-tooltip/dist/css-tooltip.css';
import './css/css-tooltip.css';
import './css/app.css';
import 'bootstrap';
import * as templates from './templates';
import {Period, Slot, pickSlots} from './utils.js';

// Gloabel Cache
const Theaters = {};

// Utils ==================================================================

const getCurrTheater = function(){
    const tid = document.body.querySelector('[data-theater-id]').getAttribute('data-theater-id');
    return Theaters[tid];
}

const forPair = function(arr){
    return arr.slice(1).map( (e, i) => [arr[i], e]);
}

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
    const theatersElem = document.body.querySelector('.app-theaters');
    theatersElem.innerHTML = templates.listTheaters({theaters});
};

const showTheater = async (theaterId) => {
    const theater = await getTheater(theaterId);
    const moviesElem = document.body.querySelector('.app-movies');
    moviesElem.innerHTML = templates.listMovies({theater});

    // Pick/Unpick a period
    moviesElem.querySelectorAll('.period').forEach(period => {
        period.addEventListener('change', event => {
            const movie = (<HTMLInputElement>event.target).closest('div').querySelector('input.movie');
            syncMovieCheckbox(movie);
            setPeriodPickiness(event.target);
            scheduling();
        });
    });

    // Change a movie's all periods
    moviesElem.querySelectorAll('input.movie').forEach(movie => {
        movie.addEventListener('change', event => {
            syncPeriodCheckbox(event.target);
            setPeriodsPickiness(event.target);
            scheduling();
        });
        syncMovieCheckbox(movie);
    });

    scheduling();
};

const getTheater = async(theaterId) => {
    let theater = Theaters[theaterId];
    if(!theater){
        theater = await fetchJSON(`/api/theater/${theaterId}`);
        theater.movies.forEach(movie => {
            movie.showtimes = movie.showtimes.map(begin => {
                const p = new Period(begin, begin + movie.len);
                p['picked'] = false;   //add flag to label if is picked.
                return p;
            });
        });
        //cache
        Theaters[theaterId] = theater;
    }
    //console.log(theater);
    return theater;
};

// Period Elements Events =================================================

const setPeriodPickiness = function(periodElem){
    const [m, p]  = periodElem.getAttribute('data-period-id').split(':');
    getCurrTheater().movies[m].showtimes[p].picked = periodElem.checked;
}
const setPeriodsPickiness = function(movieElem)
{
    movieElem.parentElement.querySelectorAll('input.period')
        .forEach(setPeriodPickiness);
};

const syncMovieCheckbox = function (movieElem){
    const picks = toArray(movieElem.parentElement.querySelectorAll('input.period'))
        .map(el => (<HTMLInputElement>el).checked);
    const checked_picks = picks.filter(ck => ck);

    if (!checked_picks.length) {
        movieElem.checked = false;
        movieElem.indeterminate = false;
    }
    else if (checked_picks.length === picks.length) {
        movieElem.checked = true;
        movieElem.indeterminate = false;
    }
    else {
        movieElem.indeterminate = true;
    }
};

const syncPeriodCheckbox = function(movieElem)
{
    const periods = movieElem.parentElement.querySelectorAll('input.period');
    periods.forEach(pd => (<HTMLInputElement>pd).checked = movieElem.checked);
};


// Scheduing ==============================================================

const scheduling = function(){
    const theater = getCurrTheater();
    const slots = genMovieSlots(theater);
    const scheds = scheduleSlots(slots);
    listSchedules(scheds);
}

const genMovieSlots = function(theater){
    return theater.movies.map(movie => {
        return movie.showtimes.filter(period => period.picked)
                                .map(period => new Slot(movie.title, period));
    })
    .reduce((slots1, slots2) => slots1.concat(slots2))
    .sort((s1, s2) => s1.period.begin - s2.period.begin);
};

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

const listSchedules = function(scheds){
    const schedElem = document.body.querySelector('.app-scheds');
    if(!scheds.length){
        schedElem.innerHTML = templates.listSchedules({scheds});
    }
    else{
        //prepare data of drawing
        const labels = getCurrTheater().movies.map(m => m.title);
        const span = new Period(Math.min(...scheds.map(s => s.begin)),
                                Math.max(...scheds.map(s => s.end)));

        //add gaps between movie slots
        const genGap = (begin, end) => (begin < end)? new Slot('<GAP>', new Period(begin ,end)): null;

        scheds.forEach(sched => {
            sched['gaps'] = [ genGap(span.begin, sched.slots[0].begin),
                              ...forPair(sched.slots).map(([s1, s2]) => genGap(s1.end, s2.begin)),
                              genGap(sched.slots[sched.slots.length-1].end, span.end) ]
                            .filter(s => s != null);
        });

        //show
        schedElem.innerHTML = templates.listSchedules({scheds, span, labels});
    }
};

const showView = async () => {
    const [view, ...params] = window.location.hash.split('/');
    switch(view){
        case '#list-theaters':
            await listTheaters();
            break;
        case '#view-theater':
            if(document.body.querySelector('.nav') == null)
                await listTheaters();
            await showTheater(params[0]);
            break;
        default:
            throw Error(`Unrecognized view: ${view}`);
    }
};

// Page setup.
(async () => {
    document.body.innerHTML = templates.main({serviceUrl:window.location.origin});
    window.addEventListener('hashchange', showView);
    showView().catch(err => window.location.hash = '#list-theaters');
})();
