export class EmergencyManager {
    constructor(AppInstance) {
        this.App = AppInstance;
        this.anomalies = [
            {
                targetId: 'SOLAR',
                title: 'Electrostatic Regolith Dust Blanket',
                desc: 'Levitated lunar terminator dust coated the photovoltaic wings, cutting solar power output by 55%.'
            },
            {
                targetId: 'OXYGEN',
                title: 'PEM Electrolysis Phase Drift',
                desc: 'Harmonic voltage ripple detected in Oxygen Assembly. Re-lock the sine wave oscilloscope.'
            },
            {
                targetId: 'WATER',
                title: 'Cryo-Slurry Valve Cavitation',
                desc: 'Differential pressure spike across reverse-osmosis membrane. Rebalance filtration valves.'
            },
            {
                targetId: 'CO2',
                title: 'Zeolite Scrubber Bed Saturation',
                desc: 'CO₂ molecular sieve cells thermally saturated! Purge reactor beds.'
            },
            {
                targetId: 'EVA',
                title: 'Secondary Airlock Seal Micro-Fracture',
                desc: 'Micrometeorite impact detected near EVA Airlock. Cycle depressurization and laser-weld.'
            },
            {
                targetId: 'CREW',
                title: 'Solar Particle Event Radiation Alert',
                desc: 'Coronal mass ejection energetics detected. Synchronize Crew Quarters shielding.'
            }
        ];
    }

    triggerRandomAnomaly() {
        const candidates = this.anomalies.filter(a => {
            const f = this.App.facilities.getById(a.targetId);
            return f && !f.hasEmergency;
        });
        if (candidates.length === 0) return null;

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        const fac = this.App.facilities.getById(chosen.targetId);
        if (fac) {
            fac.hasEmergency = true;
            fac.emergencyTitle = chosen.title;
            fac.emergencyDesc = chosen.desc;
            fac.health = Math.max(20, fac.health - 18);
            this.App.audio.playAlert();
            return { facility: fac, anomaly: chosen };
        }
        return null;
    }

    clearEmergency(facilityId) {
        const fac = this.App.facilities.getById(facilityId);
        if (fac && fac.hasEmergency) {
            fac.hasEmergency = false;
            fac.emergencyTitle = '';
            fac.emergencyDesc = '';
        }
    }

    getActiveEmergencies() {
        return this.App.facilities.facilities.filter(f => f.hasEmergency);
    }
}
