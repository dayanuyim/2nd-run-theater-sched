[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Purpose
=======
This is a *node.js* web project to schedule movie showings for 2nd-run theaters which allow you to change halls(跑廳).
The rules to apply:
- Picked show times are **OPTINAL** but exact **one** is scheduled. (cause you don't watch a movie twice?)

Data Source
===========
All data is from [開眼電影網][atmovies]

[atmovies]: http://www.atmovies.com.tw/home/

Install
=======

1. npm install
2. npm start
3. Open the browser to http://localhost:7370

How to Add a Threater?
======================
1. Identify the theater page.

    For example, The url for 民和戲院 is `http://www.atmovies.com.tw/showtime/t03323/a03`.
    
    _You need to check if changing-halls is allowed by yourself._

2. Add a row to theaters.json, like: (note the trailing comma ',')

    ```
    "t03323": {"url": "http://www.atmovies.com.tw/showtime/t03323/a03", "name": "民和戲院"},
    ```
