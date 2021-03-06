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
        <section class="app-add-theater"></section>
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

export const theaterModal = Handlebars.compile(`
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#theaterModal" data-whatever="@mdo">Add Theater</button>

<div class="modal fade" id="theaterModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Theater JSON Descriptor</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form>
          <div class="form-group">
            <!--<label for="message-text" class="col-form-label">Message:</label>-->
            <textarea class="form-control" id="message-text"></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="btn-add-theater">Add Theater</button>
      </div>
    </div>
  </div>
</div>
`);

export const nav = Handlebars.compile(`
    {{#with theater}}
    <a class="nav-link" href="#view-theater/{{id}}">{{name}}</a>
    {{/with}}
`);

Handlebars.registerHelper("nav", (theater, options)=>{
    return new Handlebars.SafeString(nav({theater}));
});

export const initNav = Handlebars.compile(`
    <nav class="nav nav-tabs">
        {{#each theaters}}
            {{nav this}}
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
                <span class="period-desc">{{this}}</span>
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
                                {{#ifeql ../../span.end end}}slot-end{{/ifeql}}
                                tooltip-bottom"
                         style="left:{{offset ../../span begin}}%;
                                width:{{ratio ../../span duration}}%"
                         data-tooltip="{{duration}} min">
                        <span>{{label}}<br>{{period}}</span>
                    </div>
                {{/each}}
                {{#each gaps}}
                    <div class="slot-gap tooltip-bottom"
                         style="left:{{offset ../../span begin}}%;
                                width:{{ratio ../../span duration}}%"
                         data-tooltip="{{duration}} min">
                    </div>
                {{/each}}
            </div>
        </div>
        {{/each}}
    {{else}}
        <p>No Possible Schedules</p>
    {{/if}}
`);