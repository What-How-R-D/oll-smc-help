#!/bin/bash

npm run build

rsync -avP build/ root@45.33.18.72:/var/www/ollsmc-help.com/