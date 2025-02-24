#!/usr/bin/env bash

SONIC_PI_VERSION=v4.5.1
BASE_URL="https://raw.githubusercontent.com/sonic-pi-net/sonic-pi/refs/tags/$SONIC_PI_VERSION/app/server/ruby/lib/sonicpi/lang/"

PATHS=(core.rb maths.rb midi.rb sound.rb western_theory.rb)

for path in ${PATHS[*]}; do
	curl -s "${BASE_URL}${path}" -o "${path}"
	sed -i -E 's/^require(_relative)?.*$//' "${path}"
	sed -i -E 's/^[ \\t]+include.*$//' "${path}"
	sed -i -E 's/SonicPi::(Core::)?//' "${path}"
	echo 'load "sonic-pi/hack.rb"' | cat - "${path}" > "${path}".1 && mv "${path}"{.1,}
done



