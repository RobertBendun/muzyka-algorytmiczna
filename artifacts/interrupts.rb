# Duży BPM byśmy mogli operować na wartościach całkowitych, prostsze obliczenia
use_bpm 360
use_synth :piano

# 1. Mierzy czas wykonanai pętli, przesyła go do funkcji realizującej przerwanie
# 2. Realizuje przerwanie w momencie osiągnięcia punktu przerwania
# Przyjmuje unikalną nazwę bloku oraz nazwę przerwania
def measure_and_interrupt(name, drop)
  if get[drop] != nil and beat.round == get[drop].round then
    sync drop
  end
  start = beat
  yield # yield uruchamia block do ... end przekazany do funkcji
  if get[name] == nil
    set name, beat - start
    print(beat - start)
  end
end

# Zrealizuj blok w momencie wystąpienia ustalonego przerwania
# Przyjmuje nazwę przerwania oraz nazwy bloków które mają zostać przerwane
def on_interrupt(drop, *waits)
  # Najmniejsza wspólna wielokrotność to najprostsza metoda wyznaczenia wspólnego momentu
  # pomiędzy dostarczonymi długościami pętli.
  # Powiązane: chińskie twierdzenie o resztach
  def nww(a, b)
    a * b / a.gcd(b)
  end
  while waits.any? { |x| get[x] == nil }
    sleep 0.1
  end
  duration = waits.inject(1) { |a, x| nww(a, get[x]) }
  target = duration * (beat.to_f / duration).ceil
  set drop, target
  sleep(target - beat) # śpimy do momentu osiągnięcia pożądanego momentu
  yield
  cue drop
end

# Czyścimy stan poprzedniego wykonania utworu
set :a, nil
set :b, nil
set :c, nil

in_thread do
  # W momencie przerwania :drop, przerwij bloki :a, :b, :c
  on_interrupt :drop, :a, :b, :c do
    sleep 2
    with_fx :echo do
      with_fx :reverb do
        play :c1, duration: 8
        play :e1, duration: 8
        play :g1, duration: 8
        sleep 8
      end
    end
  end
end

in_thread do
  loop do
    measure_and_interrupt :a, :drop do
      play :c4
      sleep 2
    end
  end
end

in_thread do
  loop do
    measure_and_interrupt :b, :drop do
      play :e4
      sleep 3
    end
  end
end

in_thread do
  loop do
    measure_and_interrupt :c, :drop do
      play :g4
      sleep 5
    end
  end
end
