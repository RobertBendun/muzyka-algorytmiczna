in_thread do
  loop do
    sync :first
    3.times do
      play :c4
      sleep 1
    end
  end
end

in_thread do
  loop do
    sync :second
    3.times do
      play :e4
      sleep 1
    end
  end
end


stop

in_thread do
  loop do
    play :c5
    sleep 1
    cue :second
    sync :first
  end
end

in_thread do
  loop do
    play :c4
    sleep 1
    cue :first
    sync :second
  end
end

stop

in_thread do
  loop do
    sync :foo
    play :e4
  end
end


in_thread do
  loop do
    cue :foo
    play :c4
    sleep 1
  end
end

print "hello"
loop do
  sleep 1
end



stop

loop do
  play ramp(:f4, :e4).tick
  sleep 1
end


stop

use_synth :piano

times = (1..4).map do |x| 1.0 / x end.ring.mirror

play_pattern_timed ring(:f5, :e5).repeat(times.length/2), times

stop

play_pattern_timed ring(:f5, :e5), ring(0.125, 0.5), release: 0.1

stop
vector(1, 2, 3).map do |n|
  n ** 2
end.each do |n|
  print(n)
end

stop

print(ramp(1, 2, 3)[1])

stop

print(ring(1, 2, 3)[-50])

stop

use_random_seed(Time.now.to_i)

vector(1, 2, 3).map do |n|
  n ** 2
end.each do |n|
  print(n)
end

stop

print((vector 1, 2, 3).choose)

