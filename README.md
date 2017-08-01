Purpose
=======
This is a *static* web project scheduling movie showings for discount theaters which allow you to change halls(跑廳).
Thus, apply the rules:
- A selected movie is a **MUST** watch
- A selected showing time is **OPTINAL** and exact one is picked. (cause you don't watch a movie twice?)

install
=======

1. All you need is setup a httpd and put all web/* files in it.

2. And update theater data every day

        python3 get_theater_info.py web/theaters.json
