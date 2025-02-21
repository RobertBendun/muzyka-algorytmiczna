# Rozpakowany resource pack z https://vanillatweaks.net/picker/resource-packs/
# z wybranym resource packiem „Old Damage Sounds”
#

path = "VanillaTweaks_r272443_MC1.21.x/assets/minecraft/sounds/damage/"

live_loop :hello do
  sample path, rand_i(3)
  sleep 0.5
end
