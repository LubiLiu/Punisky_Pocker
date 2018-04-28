#!/bin/sh

cd game-server;
nohup pomelo start >/dev/null 2>&1 &;
cd ../web-server;
nohup node app >/dev/null 2>&1 &;
