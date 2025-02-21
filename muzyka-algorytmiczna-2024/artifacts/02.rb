# Odczyt pliku
print File.read("/tmp/foo.txt")
stop

# Manipulacja syntezatorami
synth :dsaw, note: :c4, detune: 1, cutoff: 80
stop

synth :piano, note: :c4, hard: 0.25, vel: 0.9

stop

# dsaw to złożone ze sobą saw z filtrem dolnoprzepustowym
synth :saw, note: :c4
synth :saw, note: :cs4
sleep 1
synth :dsaw, note: :c4, detune: 1, cutoff: 60


stop

# można modyfikować stan odtwarzającego się dźwięku
# np. zmieniając jaki dźwięk jest odtwarzany
use_bpm 180

x = play :c4, duration: 100000, note_slide: 1
sleep 1
live_loop :siren do
  x.control note: :e4
  sleep 1
  x.control note: :c4
  sleep 1
end


stop

# play to wygodniejsze synth
synth :prophet, note: :c4
sleep 1
synth :beep, note: :c4
sleep 1

stop

use_synth :prophet
play :c4

sleep 1

with_synth :dsaw do
  play :c4
end


stop
# przez zmienne globalne możemy zatrzymywać pętle z zewnątrz
x = 0
live_loop :foo do
  play :c4
  sleep 1
  play :e4
  sleep 1
  play :g4
  sleep 1
  if x == 1 then stop end
end

sleep 12
x = 1
