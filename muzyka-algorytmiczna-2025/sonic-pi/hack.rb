class Version
  def self.new(major, minor, version)
    "#{major}.#{minor}.#{version}"
  end
end

$all = []

def doc(params)
  $all << params
end
