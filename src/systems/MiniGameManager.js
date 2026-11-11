export class MiniGameManager {
    constructor(AppInstance) {
        this.App = AppInstance;
        this.activeFacility = null;
        this.animFrame = null;
        this.cleanupFn = null;
    }

    launchForCurrentFacility() {
        const fac = this.App.facilities.getSelected();
        if (!fac) return;

        if (this.App.dailyOps.ap <= 0) {
            this.App.ui.showToast('NO ACTION POINTS (AP) REMAINING THIS SOL!', 'amber');
            this.App.audio.playAlert();
            return;
        }

        this.activeFacility = fac;
        this.App.ui.closeFacilityModal();
        this.App.audio.playClick();

        const modal = document.getElementById('minigameModal');
        document.getElementById('mgFacilityBadge').textContent = `${fac.code} // ${fac.name.toUpperCase()}`;
        document.getElementById('mgTitle').textContent = fac.minigameTitle;
        document.getElementById('mgStatusText').innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>CALIBRATION IN PROGRESS...</span>`;

        const ws = document.getElementById('mgWorkspace');
        ws.innerHTML = '';
        modal.classList.remove('hidden');

        import(`../minigames/${fac.minigameType}Puzzle.js`).then(module => {
            const PuzzleClass = module.default;
            this.currentPuzzleInstance = new PuzzleClass(this, ws);
            this.currentPuzzleInstance.init();
        });
    }

    closeMinigame() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.animFrame = null;
        if (this.currentPuzzleInstance && this.currentPuzzleInstance.destroy) {
            this.currentPuzzleInstance.destroy();
        }
        document.getElementById('minigameModal').classList.add('hidden');
    }

    completeMinigame(bonusText = '') {
        if (!this.activeFacility) return;
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.animFrame = null;

        const fac = this.activeFacility;
        this.App.dailyOps.useAP(1);
        fac.calibratedToday = true;
        fac.health = Math.min(100, fac.health + 22);

        if (fac.hasEmergency) {
            this.App.emergencies.clearEmergency(fac.id);
        }

        if (fac.id === 'SOLAR') this.App.resources.power = Math.min(100, this.App.resources.power + 14);
        if (fac.id === 'WATER') this.App.resources.water = Math.min(100, this.App.resources.water + 12);
        if (fac.id === 'OXYGEN') this.App.resources.oxygen = Math.min(100, this.App.resources.oxygen + 12);
        if (fac.id === 'CO2') this.App.resources.co2 = Math.max(350, this.App.resources.co2 - 140);
        if (fac.id === 'LAB') this.App.resources.science += 18;
        if (fac.id === 'EVA') { this.App.resources.science += 10; this.App.resources.crewHealth = Math.min(100, this.App.resources.crewHealth + 5); }
        if (fac.id === 'CREW') this.App.resources.crewHealth = Math.min(100, this.App.resources.crewHealth + 14);
        if (fac.id === 'CMD') { this.App.resources.science += 12; this.App.resources.power = Math.min(100, this.App.resources.power + 8); }

        this.App.audio.playSuccess();
        document.getElementById('mgStatusText').innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i><span class="text-emerald-400 font-bold">TELEMETRY LOCKED! +25% EFFICIENCY</span>`;

        setTimeout(() => {
            this.closeMinigame();
            this.App.ui.updateAll();
            this.App.ui.showToast(`${fac.shortName.toUpperCase()} CALIBRATED! ${bonusText}`, 'emerald');
        }, 900);
    }
}
