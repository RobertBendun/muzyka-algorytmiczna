use_bpm 360

start = beat

live_loop :a do
  if (beat - start).round != 0 and (beat - start).round % 30.0 == 0 then
    sync :foo
  end
  play :c4
  sleep 2
end

live_loop :b do
  if (beat - start).round % 30.0 == 0 then sync :foo end
  play :g4
  sleep 3
end

live_loop :c do
  if (beat - start).round % 30 == 0 then sync :foo end
  play :e4
  sleep 5
end

sleep 30
play :c3
play :e3
play :g3
sleep 1
cue :foo


stop
set :wait, false

in_thread(name: :foo) do
  loop do
    if get[:wait] then
      sync :continue
      cue :waited
    end
    play :c4
    sleep 1
    play :e4
    sleep 1
    play :g4
    sleep 1
  end
end

stop

# Pętla kontroluje czas przez zmniejszanie czasu sleep'ów
# halves(1, 4) = (ring 1.0, 0.5, 0.25, 0.125)
live_loop :czas do
  set :shared, halves(1, 4).tick
  sleep 4
end

live_loop :wysokie do
  synth :piano, note: :e4
  sleep get[:shared]
  synth :piano, note: :f4
  sleep get[:shared]
end

live_loop :niskie do
  with_fx :lpf, cutoff: :c4 do |f|
    f.control cutoff: :g2, cutoff_slide: get[:shared]
    synth :piano, note: :c2, duration: 4 * get[:shared]
    synth :piano, note: :e2, duration: 4 * get[:shared]
    synth :piano, note: :g2, duration: 4 * get[:shared]
  end
  sleep 2 * get[:shared]
end

stop

live_loop :a do
  if get[:first] then
    play :c4
    sleep 1
  else
    play :e4
    sleep 1
  end
end


stop

set :n, 1

live_loop :a do
  play :c4
  sleep get[:n]
end

stop

in_thread do
  set :n, 10
end

sleep 1
print get[:n]


stop

n = 1

live_loop :a do
  play :c4
  sleep n
end

live_loop :b do
  play :g4
  sleep n
  n = 4.0
end




stop

3.times do |i|
  in_thread do
    print(i, rrand_i(100, 999))
  end
end
