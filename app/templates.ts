import * as Handlebars from '../node_modules/handlebars/dist/handlebars.js';

Handlebars.registerHelper("inc", (value, options) => parseInt(value)+1);
Handlebars.registerHelper("indexOf", (arr, elem, options) => arr.indexOf(elem));
Handlebars.registerHelper("ifeql", function(v1, v2, options){
    return (v1 === v2)? options.fn(this): options.inverse(this);
});

Handlebars.registerHelper("offset", (span, begin, options) => 100 * (begin-span.begin) / span.duration);
Handlebars.registerHelper("ratio", (span, duration, options) => 100 * duration / span.duration);

Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
});

export const main = Handlebars.compile(`
    <div class="container">
        <h1><a href="{{serviceUrl}}">二輪戲院排程器</a></h1>
        <section class="app-alerts"></section>
        <section class="app-theaters"></section>
        <section class="app-movies"></section>
        <section class="app-scheds"></section>
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
    <nav class="nav nav-tabs">
        {{#each theaters}}
        <a class="nav-link" href="#view-theater/{{id}}">{{name}}</a>
        {{/each}}
    </nav>
`);

export const listMovies = Handlebars.compile(`
    <h2>{{theater.name}} - {{theater.date}}</h2>
    <div data-theater-id={{theater.id}} ></div>

    {{#each theater.movies}}
    <div>
        <!-- Movie -->
        <input type="checkbox" class="movie">
        <a href="{{link}}" target="_blank">{{title}}</a>
        <!-- Periods -->
        <span class="periods">
            {{#each showtimes}}
                <input type="checkbox" {{#if picked}}checked{{/if}} class="period" data-period-id="{{@../index}}:{{@index}}">
                {{this}}
            {{/each}}
        </span>
    </div>
    {{/each}}
`);

export const listSchedules = Handlebars.compile(`
    {{#if scheds}}
        {{#each scheds}}
        <div class="sched">
            <div class="sched-sn">{{inc @index}}</div>
            <div class="sched-slots">
                {{#each slots}}
                    <div class="slot slot{{indexOf ../../labels label}}
                                {{#ifeql ../../span.begin begin}}slot-begin{{/ifeql}}
                                {{#ifeql ../../span.end end}}slot-end{{/ifeql}}"
                         style="left:{{offset ../../span begin}}%;
                                width:{{ratio ../../span duration}}%"
                         title="{{period}} ({{duration}} min)">
                        {{label}}<br>{{period}}
                    </div>
                {{/each}}
                {{#each gaps}}
                    <div class="slot-gap"
                         style="left:{{offset ../../span begin}}%;
                                width:{{ratio ../../span duration}}%"
                         title="{{duration}} min">
                    </div>
                {{/each}}
            </div>
        </div>
        {{/each}}
    {{else}}
        <p>No Possible Schedules</p>
    {{/if}}
`);