#!/bin/bash

if [ -z "$1" ]; then
    echo "usage: `basename $0` <theater-json>"
    exit 1
fi

theater_path=$(readlink -f "$1")
outdir=$(dirname "$theater_path")


#cd "$outdir"
cat "$theater_path" | \
    grep url | \
    awk -F'"' '{print "curl \"" $4 "\" > \"" $8 "\""}' | \
    sed "s; > \"; > \"$outdir/;" | \
    xargs -L1 -I {} sh -c "{}"
