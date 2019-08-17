#!/bin/bash
git reset --hard
git pull
npm run tsc
npm stop&&npm start
