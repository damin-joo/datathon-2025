CarbonScore = max(0, 40 - (carbon_kg * 4))
CategoryScore = sustainability_score * 8
PatternBonus = repeat_good_behaviour * 2

EcoScore = CarbonScore + CategoryScore + PatternBonus
EcoScore = min(EcoScore, 100)