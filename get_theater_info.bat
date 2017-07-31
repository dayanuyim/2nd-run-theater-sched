@echo off

mkdir theaters

REM TODO Parse theaters.json to download

REM 景美佳佳戲院
curl "http://www.atmovies.com.tw/showtime/t02f05/a02/" > theaters/t02f05.html

REM 朝代戲院
curl "http://www.atmovies.com.tw/showtime/t02f07/a02/" > theaters/t02f07.html

REM 湳山戲院
curl "http://www.atmovies.com.tw/showtime/t02f08/a02/" > theaters/t02f08.html

REM 林園電影城
curl "http://www.atmovies.com.tw/showtime/t02e02/a02/" > theaters/t02e02.html

REM 三重幸福戲院
curl "http://www.atmovies.com.tw/showtime/t02f23/a02/" > theaters/t02f23.html
