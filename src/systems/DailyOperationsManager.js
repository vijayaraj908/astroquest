export class DailyOperationsManager {
    constructor(AppInstance) {
        this.App = AppInstance;
        this.reset();
    }

    reset() {
        this.sol = 1;
        this.maxSol = 5;
        this.ap = 4;
        this.maxAp = 4;
    }

    useAP(amount = 1) {
        this.ap = Math.max(0, this.ap - amount);
        this.App.ui.updateAll();
    }

    openEndSolConfirmation() {
        this.App.audio.playClick();
        const deltas = this.App.resources.computeNetDailyDeltas(this.App.facilities.facilities);
        const reportModal = document.getElementById('solSummaryModal');
        const titleEl = document.getElementById('solReportTitle');
        const bodyEl = document.getElementById('solReportBody');

        titleEl.textContent = `SOL ${this.sol} TELEMETRY REVIEW // ADVANCE TO SOL ${this.sol + 1}`;

        const fmtDelta = (val, unit = '', invertColor = false) => {
            const sign = val >= 0 ? '+' : '';
            const good = invertColor ? val <= 0 : val >= 0;
            const col = good ? 'text-emerald-400' : 'text-rose-400';
            return `<span class="font-mono font-bold ${col}">${sign}${val}${unit}</span>`;
        };

        const activeEmergencies = this.App.emergencies.getActiveEmergencies();

        bodyEl.innerHTML = `
            <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <div class="text-xs font-mono text-cyan-400 uppercase mb-2.5">PROJECTED OVERNIGHT RESOURCE DELTAS</div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between"><span class="text-slate-400">Power:</span>${fmtDelta(deltas.power, ' kWh')}</div>
                    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between"><span class="text-slate-400">Oxygen:</span>${fmtDelta(deltas.oxygen, ' %')}</div>
                    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between"><span class="text-slate-400">Water:</span>${fmtDelta(deltas.water, ' L')}</div>
                    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between"><span class="text-slate-400">CO₂ Level:</span>${fmtDelta(deltas.co2, ' ppm', true)}</div>
                    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between"><span class="text-slate-400">Science:</span>${fmtDelta(deltas.science, ' PTS')}</div>
                    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between"><span class="text-slate-400">Med-Bay Heal:</span>${fmtDelta(deltas.crewHeal, ' %')}</div>
                </div>
            </div>
            ${this.ap > 0 ? `
                <div class="glass-panel-amber rounded-xl p-3 text-xs text-amber-200 flex items-center gap-2.5">
                    <i class="fa-solid fa-bolt text-amber-400 text-base"></i>
                    <span>You still have <strong>${this.ap} unused Action Point(s)</strong> today! You can close this dialog to calibrate or repair more modules first, or proceed.</span>
                </div>
            ` : ''}
            ${activeEmergencies.length > 0 ? `
                <div class="glass-panel-danger rounded-xl p-3 text-xs text-red-200 flex items-center gap-2.5">
                    <i class="fa-solid fa-triangle-exclamation text-red-400 text-base"></i>
                    <span>WARNING: <strong>${activeEmergencies.length} unresolved emergency anomaly</strong> is still active and will inflict extra hull wear overnight!</span>
                </div>
            ` : ''}
        `;

        reportModal.classList.remove('hidden');
    }

    confirmNextSol() {
        document.getElementById('solSummaryModal').classList.add('hidden');
        const deltas = this.App.resources.computeNetDailyDeltas(this.App.facilities.facilities);
        const result = this.App.resources.applyDailyDeltas(deltas);

        if (this.App.resources.crewHealth <= 0) {
            this.App.triggerGameOver(false, 'Crew vitality dropped to 0% due to life-support failure.');
            return;
        }

        if (this.sol >= this.maxSol) {
            this.App.triggerGameOver(true, 'Congratulations Commander! You successfully sustained Shackleton Outpost across all 10 lunar qualification Sols.');
            return;
        }

        this.sol += 1;
        this.ap = this.maxAp;
        this.App.facilities.degradeDaily();

        if (Math.random() < 0.65) {
            const ev = this.App.emergencies.triggerRandomAnomaly();
            if (ev) {
                this.App.ui.showToast(`SOL ${this.sol} ALERT: ${ev.anomaly.title} at ${ev.facility.shortName}!`, 'red');
            }
        } else {
            this.App.audio.playSuccess();
            this.App.ui.showToast(`SOL ${this.sol} INITIALIZED // ALL TELEMETRY UPDATED`, 'cyan');
        }

        this.App.ui.updateAll();
    }
}
