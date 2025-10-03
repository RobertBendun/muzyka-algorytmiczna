#!/usr/bin/env bash

rsync --recursive --links --times --progress --chmod=Da+rX,a+rX --exclude='.git/' --delete \
	. robben@lts.wmi.amu.edu.pl:/home/faculty/robben/public_html/

ssh robben@lts.wmi.amu.edu.pl chmod -R a+rX /home/faculty/robben/public_html
