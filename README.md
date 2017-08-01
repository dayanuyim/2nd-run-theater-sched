Purpose
=======
This is a *static* web project scheduling movie showings for discount theaters which allow you to change halls(跑廳).
Thus, apply the rules:
- A selected movie is a **MUST** watch
- A selected showing time is **OPTINAL** and exact one is picked. (cause you don't watch a movie twice?)

Data Source
===========
All data is from [開眼電影網][atmovies]

[atmovies]: http://www.atmovies.com.tw/home/

Install
=======

1. All you need is setup a httpd and put all web/* files in it.

2. And update theater data periodly, e.g., per day.

        python3 get_theater_info.py web/theaters.json

Add Threater?
=============
1. Identify the theater page.

    For example, The url for 民和戲院 is `http://www.atmovies.com.tw/showtime/t03323/a03`.
    
    _You need to check weather changing halls is allowed by yourself._

2. Add a row to web/theaters.json, like

        {"url": "http://www.atmovies.com.tw/showtime/t03323/a03", "local": "theaters/t03323.html", "title": "民和戲院"},

    The local filename is arbitrary, just not overwrite other files.

