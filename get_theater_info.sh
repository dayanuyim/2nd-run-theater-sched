#!/bin/bash

mkdir -p theaters
cat theaters.json | grep url | awk -F'"' '{print "curl " $4 " > " $8}' | xargs -L1 -I {} sh -c "{}"
