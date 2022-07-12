#!/bin/bash

mv .env .envTest
mv .envDeploy .env

npm run build

mv .env .envDeploy
mv .envTest .env

rsync -avP build/ root@45.33.18.72:/var/www/ollsmc-help.com/