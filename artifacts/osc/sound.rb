use_synth :tri

define :single do |v, length|
  play hz_to_midi(120 + 1000.0 * v.to_f/length), \
    duration: 0.125, \
    amp: 0.25
end


define :less do |array, i, j|
  [array[i], array[j]].each do |v|
    single(v, array.length)
  end
  sleep 0.125

  osc_send "127.0.0.1", 8888, "/less", i, j

  array[i] < array[j]
end

define :swap do |array, i, j|
  array[i], array[j] = array[j], array[i]
  osc_send "127.0.0.1", 8888, "/swap", i, j
end

define :bubble_sort do |array|
  swapped = true
  n = array.length
  while swapped
    swapped = false
    for i in 1...n
      if less(array, i, i-1) then
        swap(array, i-1, i)
        swapped = true
      end
    end
    n -= 1
  end
  array
end

define :coctail_shaker_sort do |array|
  swapped = true
  b = 0
  e = array.length - 1
  loop do
    swapped = false
    for i in b.upto(e-1)
      if less(array, i+1, i) then
        swap(array, i, i+1)
        swapped = true
      end
    end
    e -= 1
    break unless swapped
    swapped = false

    for i in e.downto(b)
      if less(array, i+1, i) then
        swap(array, i, i+1)
        swapped = true
      end
    end

    b += 1
    break unless swapped
  end
  array
end

define :insertion_sort_linear do |array|
  for i in 1...array.length
    j = i
    while j > 0 and less(array, j, j-1)
      swap(array, j, j-1)
      j -= 1
    end
  end
  array
end

define :bitonic_sort do |array|
  n = array.length
  k = 2
  while k <= n
    j = k/2
    while j > 0
      n.times do |i|
      l = i ^ j
      if l > i then
        if ((i & k) == 0 and less(array, l, i)) or ((i & k) != 0 and less(array, i, l)) then
          swap(array, i, l)
        end
      end
    end
    j /= 2
  end
  k *= 2
end
array
end

define :selection_sort do |array|
  for i in 0...array.length
    min = i
    for j in (i+1)...array.length
      if less(array, j, min) then
        min = j
      end
    end
    swap(array, i, min)
  end
  array
end

define :radix_sort_lsd do |array|
  base = 4
  passes = (Math.log(array.minmax.map(&:abs).max) / Math.log(base)).floor + 1
  passes.times do |i|
    buckets = Array.new(2 * base) { [] }
    base_i = base**i

    # elements are added to buckets
    # according to the current place-value digit
    array.each do |j|
      n = (j / base_i) % base
      n += base if j >= 0
      buckets[n] << j
      buckets.flatten.index(j)
    end
    new_array = buckets.flatten
    new_array.each_with_index do |v, i|
      single(v, array.length)
      osc_send "127.0.0.1", 8888, "/set", i, v
      sleep 0.125
    end
    array = new_array
    sleep 1
  end
  array
end

define :sort_array do |algo_name, algo_func, array|
  osc_send "127.0.0.1", 8888, "/reset", array.length
  sleep 0.125
  array.each_with_index do |v, i|
    osc_send "127.0.0.1", 8888, "/set", i, v
  end
  osc_send "127.0.0.1", 8888, "/name", algo_name
  sleep 0.125
  print algo_func.call(array)
end
