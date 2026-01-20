#!/bin/sh

cd /app
npm i
npm run build
npm run start
tail -f /dev/null


