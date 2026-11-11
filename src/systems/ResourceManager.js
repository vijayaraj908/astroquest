export class ResourceManager {
    constructor() {
        this.reset();
    }

    reset() {
        this.power = 85;
        this.oxygen = 90;
        this.water = 84;
        this.co2 = 460;
        this.science = 30;
        this.crewHealth = 100;
        this.crewDailyDemand = {
            power: 0,
            oxygen: -22,
            water: -20,
            co2: 165
        };
    }

    computeNetDailyDeltas(facilities) {
        let dPower = this.crewDailyDemand.power;
        let dOxygen = this.crewDailyDemand.oxygen;
        let dWater = this.crewDailyDemand.water;
        let dCO2 = this.crewDailyDemand.co2;
        let dScience = 0;
        let dCrewHeal = 0;

        facilities.forEach(fac => {
            const healthFactor = Math.max(0.15, fac.health / 100);
            const effFactor = fac.efficiency * (fac.calibratedToday ? 1.25 : 1.0) * (fac.hasEmergency ? 0.45 : 1.0);
            const mult = healthFactor * effFactor;

            const out = fac.baseOutputs;
            if (out.power) dPower += out.power > 0 ? Math.round(out.power * mult) : out.power;
            if (out.oxygen) dOxygen += out.oxygen > 0 ? Math.round(out.oxygen * mult) : out.oxygen;
            if (out.water) dWater += out.water > 0 ? Math.round(out.water * mult) : out.water;
            if (out.co2) dCO2 += Math.round(out.co2 * mult);
            if (out.science) dScience += Math.round(out.science * mult);
            if (out.crewHeal) dCrewHeal += Math.round(out.crewHeal * mult);
        });

        return { power: dPower, oxygen: dOxygen, water: dWater, co2: dCO2, science: dScience, crewHeal: dCrewHeal };
    }

    applyDailyDeltas(deltas) {
        this.power = Math.max(0, Math.min(100, this.power + deltas.power));
        this.oxygen = Math.max(0, Math.min(100, this.oxygen + deltas.oxygen));
        this.water = Math.max(0, Math.min(100, this.water + deltas.water));
        this.co2 = Math.max(350, Math.min(2200, this.co2 + deltas.co2));
        this.science = Math.max(0, this.science + deltas.science);

        let healthDelta = deltas.crewHeal;
        const notes = [];

        if (this.power <= 0) {
            healthDelta -= 24;
            notes.push('CRITICAL: Outpost battery grid depleted! (-24% Crew Vitality).');
        } else if (this.power < 20) {
            healthDelta -= 6;
            notes.push('WARNING: Low power reserves (-6% Vitality).');
        }

        if (this.oxygen <= 0) {
            healthDelta -= 38;
            notes.push('CRITICAL HYPOXIA: Oxygen reserves exhausted! (-38% Crew Vitality).');
        } else if (this.oxygen < 25) {
            healthDelta -= 10;
            notes.push('WARNING: Cabin O₂ low (-10% Vitality).');
        }

        if (this.water <= 0) {
            healthDelta -= 25;
            notes.push('CRITICAL DEHYDRATION: Water tanks dry! (-25% Crew Vitality).');
        } else if (this.water < 20) {
            healthDelta -= 6;
            notes.push('WARNING: Water rationing (-6% Vitality).');
        }

        if (this.co2 >= 1500) {
            healthDelta -= 26;
            notes.push('CRITICAL HYPERCAPNIA: Toxic CO₂ above 1500 ppm! (-26% Crew Vitality).');
        } else if (this.co2 >= 1050) {
            healthDelta -= 8;
            notes.push('WARNING: Elevated cabin CO₂ (-8% Vitality).');
        }

        this.crewHealth = Math.max(0, Math.min(100, this.crewHealth + healthDelta));
        return { healthDelta, notes };
    }
}
