import * as Handlebars from '../node_modules/handlebars/dist/handlebars.js';

export const main = Handlebars.compile(`
    <div class="container">
        <h1>二輪戲院排程器</h1>
        <div class="app-alerts"></div>
        <div class="app-theaters"></div>
        <div class="app-movies"></div>
    </div>
`);

export const alert = Handlebars.compile(`
    <div class="alert alert-{{type}} alert-dismissible fade-in" role="alert">
        <button class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        {{message}}
    </div>
`);

export const listTheaters = Handlebars.compile(`
    <ul>
        {{#each theaters}}
        <li><a href="#view-theater/{{id}}">{{name}}</a></li>
        {{/each}}
    </ul>
`);

export const listMovies = Handlebars.compile(`
    <h2>{{theater.name}} - {{theater.date}}</h2>
    <div data-theater-id={{theater.id}} ></div>

    {{#each theater.movies}}
    <div>
        <!-- Movie -->
        <input type="checkbox" checked class="movie">
        <a href="{{link}}" target="_blank">{{title}}</a>
        <!-- Periods -->
        <span class="periods">
            {{#each showtimes}}
                <input type="checkbox" checked class="period" data-period-id="{{../../theater.id}}:{{@../index}}:{{@index}}">
                {{this}}
            {{/each}}
        </span>
    </div>
    {{/each}}

    <div class="app-scheds" </div>
`);

Handlebars.registerHelper("inc", (value, options) => parseInt(value)+1);

export const listSchedules = Handlebars.compile(`
    {{#if scheds}}
        {{#each scheds}}
        <div class="sched">
            <div class="sched-sn">{{inc @index}}</div>
            <div class="sched-slots">
                {{#each slots}}
                    <div class="slot slot{{label_idx}}" style="left:{{left}}%; width:{{width}}%">
                        {{label}}<br>{{period}}
                    </div>
                {{/each}}
            </div>
        </div>
        {{/each}}
    {{else}}
        <p>No Possible Schedules</p>
    {{/if}}
`);