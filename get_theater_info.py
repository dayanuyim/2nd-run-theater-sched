#!/usr/bin/env python3

import os
import sys
import json
import codecs
import urllib.request
import shutil

def defaultString(s, def_s):
    return s if s else def_s

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("usage: %s <json-file>" % sys.argv[0]);
        sys.exit(1)

    #args
    theater_path = sys.argv[1]
    outdir = defaultString(os.path.dirname(theater_path), ".")

    #read theaters
    with codecs.open(theater_path, 'r', encoding='utf-8') as theater_file:
        theaters = json.load(theater_file)

    #download theaters
    for th in theaters:
        url = th['url']
        local = outdir + "/" + th['local']

        os.makedirs(os.path.dirname(local), exist_ok=True)

        print('downloading %s to %s' % (url, local))
        with urllib.request.urlopen(url, timeout=20) as resp, open(local, 'wb') as out_file:
            shutil.copyfileobj(resp, out_file)


