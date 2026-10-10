#!/bin/sh

yarn

rsync -avz --delete dist/ root@103.12.76.214:/var/www/landing-source/dist/
