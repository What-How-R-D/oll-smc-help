#!/bin/bash

git pull 
npm run build

rsync -avP build/ /var/www/example.com/