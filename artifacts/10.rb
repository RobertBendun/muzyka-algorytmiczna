apple = "SAŁATA"
print apple

apple.chars # = ["S", "A", "Ł", "A", "T", "A"]

for pomidor in ["S", "A", "Ł", "A", "T", "A"]
  print pomidor
end

print "S"
print "A"
print "Ł"
# ....

for pomidor in apple.chars
  print pomidor
end

stop

define :play_segment do |tones, segment|
  for x in segment.chars
    if x == "A" then play :c4 end
    if x == "Z" then play :d4 end
    if x == "W" then play :e4 end
    if x == "C" then
      in_thread do
        play_segment(tones, segment)
      end
    end
    play_pattern_timed tones, 1
    sleep 1
  end
end

tones = scale(:c4, :chromatic)[0..12].flatten.shuffle.ring
play_segment(tones, "ACAA")

stop

tones = scale(:c4, :chromatic)[0..12].flatten.shuffle.ring
print tones

use_bpm 300

segment = kolejny(kolejny("A"))


for x in segment.chars
  if x == "A" then
    print "inwersja"
    tones = inwersja(tones)
  end
  if x == "Z" then tones = rak(tones) end
  if x == "W" then tones = rak_inwersji(tones) end
  if x == "C" then
    in_thread do
      # robimy nic
    end

  end
  play_pattern_timed tones, 1
  sleep 1
end

stop

define :kolejny do |str|
  kolejny = ""
  for x in str.chars
    if x == "A" then kolejny += "AZA" end
    if x == "Z" then kolejny += "WAW" end
    if x == "W" then kolejny += "CC" end
    if x == "C" then kolejny = kolejny + "A" end
  end
  kolejny
end

segment = kolejny(kolejny(kolejny("A")))
for x in segment.chars
  if x == "A" then play :c4 end
  if x == "Z" then play :d4 end
  if x == "W" then play :e4 end
  if x == "C" then play :g4 end
  sleep 1
end


stop


print kolejny

str = kolejny
kolejny = ""
for x in str.chars
  if x == "A" then kolejny += "AZA" end
  if x == "Z" then kolejny += "WAW" end
  if x == "W" then kolejny += "CC" end
  if x == "C" then kolejny += "A" end
end
print kolejny


# sample "/tmp/Tenor Saxophone/Tenor Saxophone/Samples/Far-Room Mic/Sax Sample - Plunger_1.wav"

