#!/bin/bash
git reset --hard
git push
npm run tsc
npm stop&&npm start
