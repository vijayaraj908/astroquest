import { FACILITY_CONFIGS } from '../data/facilities.js';

export class FacilityManager {
    constructor() {
        this.facilities = [];
        this.selectedFacilityId = null;
        this.reset();
    }

    reset() {
        this.facilities = FACILITY_CONFIGS.map(cfg => ({
            ...cfg,
            health: 96,
            level: 1,
            efficiency: 1.0,
            calibratedToday: false,
            hasEmergency: false,
            emergencyTitle: '',
            emergencyDesc: ''
        }));
        this.selectedFacilityId = null;
    }

    getById(id) {
        return this.facilities.find(f => f.id === id);
    }

    getSelected() {
        return this.getById(this.selectedFacilityId);
    }

    degradeDaily() {
        this.facilities.forEach(f => {
            f.calibratedToday = false;
            const wear = Math.floor(Math.random() * 7) + 4;
            const emergencyWear = f.hasEmergency ? 12 : 0;
            f.health = Math.max(15, f.health - (wear + emergencyWear));
        });
    }

    repairCurrentFacility(App) {
        const fac = this.getSelected();
        if (!fac) return;
        if (App.dailyOps.ap <= 0) {
            App.ui.showToast('NO ACTION POINTS (AP) REMAINING THIS SOL!', 'amber');
            App.audio.playAlert();
            return;
        }
        if (App.resources.power < 10) {
            App.ui.showToast('INSUFFICIENT POWER (NEEDS 10 kWh)!', 'red');
            App.audio.playAlert();
            return;
        }

        App.dailyOps.useAP(1);
        App.resources.power = Math.max(0, App.resources.power - 10);
        fac.health = Math.min(100, fac.health + 35);
        if (fac.hasEmergency) {
            App.emergencies.clearEmergency(fac.id);
        }
        App.audio.playSuccess();
        App.ui.showToast(`${fac.shortName.toUpperCase()} REPAIRED TO ${fac.health}% INTEGRITY`, 'emerald');
        App.ui.updateAll();
        App.ui.openFacilityModal(fac.id);
    }

    upgradeCurrentFacility(App) {
        const fac = this.getSelected();
        if (!fac) return;
        const cost = fac.level * 25;
        if (App.resources.science < cost) {
            App.ui.showToast(`NEED ${cost} SCIENCE DATA PTS TO UPGRADE!`, 'amber');
            App.audio.playAlert();
            return;
        }

        App.resources.science -= cost;
        fac.level += 1;
        fac.efficiency = +(1.0 + (fac.level - 1) * 0.22).toFixed(2);
        fac.health = Math.min(100, fac.health + 15);
        App.audio.playSuccess();
        App.ui.showToast(`${fac.shortName.toUpperCase()} UPGRADED TO LEVEL ${fac.level} (${Math.round(fac.efficiency * 100)}% EFF)!`, 'emerald');
        App.ui.updateAll();
        App.ui.openFacilityModal(fac.id);
    }
}
