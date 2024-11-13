windows = "C:\\Users\\rbendun\\tomatoes.wav"
linux_macos = "~/tomatoes.wav"

sample windows
sample linux_macos

sample :drum_roll

stop

load_sample "tomatoes.wav"

with_fx :reverb do
  with_fx :ring_mod do
    sample "tomatoes.wav"
  end
end
stop


sample "tomatoes.wav", start: 0.4, finish: 0.67, pitch: 12, lpf: :c8
sleep sample_duration("tomatoes.wav", start: 0.4, finish: 0.67, pitch: 12, lpf: :c8)

stop

sample :loop_breakbeat, rate: 0.5
stop


sample :arovane_beat_a, start: 0, finish: 0.1
sleep sample_duration(:arovane_beat_a, start: 0, finish: 0.1)
play :c6
stop

sample :arovane_beat_a, start: 0.8, finish: 1


stop

use_bpm 60

sample :arovane_beat_a

