Purpose
=======
This is a *static* web project scheduling movie showings for discount theaters which allow you to change halls(跑廳).
The rules to apply:
- A selected movie is a **MUST** watch
- A selected showing time is **OPTINAL** and exact one is picked. (cause you don't watch a movie twice?)

Data Source
===========
All data is from [開眼電影網][atmovies]

[atmovies]: http://www.atmovies.com.tw/home/

Install
=======

1. Put files under **web/** to the httpd, and access **index.html**. (Or no httpd if the browser enables local-file-access.)

2. Update theater data periodly or per day:

        python3 get_theater_info.py web/theaters.json

    , or in linux:

        get_theater_info.sh web/theaters.json

    , or in windows:

        get_theater_info.bat (hard-coded, not to read web/theaters.json)

How to Add a Threater?
=============
1. Identify the theater page.

    For example, The url for 民和戲院 is `http://www.atmovies.com.tw/showtime/t03323/a03`.
    
    _You need to check if changing-halls is allowed by yourself._

2. Add a row to web/theaters.json, like

        {"url": "http://www.atmovies.com.tw/showtime/t03323/a03", "local": "theaters/t03323.html", "title": "民和戲院"},

    The local filename is arbitrary, just not overwrite other files.

