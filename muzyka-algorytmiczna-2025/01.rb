# ALT+R <- uruchom kod w danym edytorze
# ALT+S <- zatrzymaj kod w danym edytorze
# ALT+I
# ALT+SHIFT+S - zapisz

play :c4, amp: 1

sleep 1

play :c4, amp: 1/8.0
play :e4, amp: 1/8.0
play :g4, amp: 1/8.0
play :f4, amp: 1/8.0
play :e4, amp: 1/8.0
play :c4, amp: 1/8.0
play :c4, amp: 1/8.0
play :c4, amp: 1/8.0
play :c4, amp: 1/8.0


stop

use_synth :dsaw

play :c4
sleep 1
play :c4
sleep 1

use_synth :prophet
play :c4, attack: 3





stop

play :c4,
  attack: 3, # jak długo atakujemy
  attack_level: 1, # do jakiego poziomu
  decay: 3,
  decay_level: 0,
  sustain: 0,
  release: 0

stop

play note(:c4, octave: 7)
sleep 1
play :c7
sleep 1
play note(:c4) + 3 * 12
sleep 1
play 60 + 3 * 12

stop

use_bpm 60

live_loop :foo do
  play :f4
  sleep 1
  play :f4
  sleep 1
  play :f4
  sleep 1
  play :e2
  sleep 1
end


stop

loop do
  play :c4
  play :e4
  play :g4
end

