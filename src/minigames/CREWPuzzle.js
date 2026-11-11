export default class CREWPuzzle {
    constructor(manager, workspace) {
        this.manager = manager;
        this.ws = workspace;
        this.metrics = [
            { name: 'Circadian LED Day-Night Spectrum', status: false, icon: 'fa-sun' },
            { name: 'Polyethylene Water-Wall Radiation Shield', status: false, icon: 'fa-shield-halved' },
            { name: 'Acoustic & Thermal Cabin Equilibrium', status: false, icon: 'fa-heart-pulse' }
        ];
    }

    init() {
        document.getElementById('mgInstructions').innerHTML = `
            Stabilize all 3 Crew Habitat homeostatic systems to <strong class="text-emerald-400">100% Optimal Sync</strong> to restore astronaut morale & vitality.
        `;
        this.render();
    }

    render() {
        this.ws.innerHTML = `
            <div class="space-y-3 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                ${this.metrics.map((m, i) => `
                    <div class="bg-slate-900/90 border ${m.status ? 'border-emerald-400' : 'border-slate-800'} rounded-xl p-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg ${m.status ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/15 text-rose-400'} flex items-center justify-center text-lg">
                                <i class="fa-solid ${m.icon}"></i>
                            </div>
                            <div>
                                <div class="text-xs sm:text-sm font-bold text-white">${m.name}</div>
                                <div class="text-[11px] font-mono ${m.status ? 'text-emerald-400' : 'text-amber-300'}">${m.status ? 'HOMEOSTASIS SYNCHRONIZED' : 'DRIFT DETECTED - CLICK TO SYNC'}</div>
                            </div>
                        </div>
                        <button data-mid="${i}" class="crew-sync-btn btn-sci px-4 py-2 rounded-lg font-mono text-xs ${m.status ? 'text-emerald-300 border-emerald-400' : 'text-cyan-300'}">
                            ${m.status ? 'LOCKED ✓' : 'CALIBRATE'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        this.ws.querySelectorAll('.crew-sync-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-mid'));
                if (!this.metrics[idx].status) {
                    this.metrics[idx].status = true;
                    this.manager.App.audio.playBeep(640 + idx * 120, 0.09, 'sine');
                    this.render();
                    if (this.metrics.every(m => m.status)) {
                        this.manager.completeMinigame('(+14% Crew Vitality Restored)');
                    }
                }
            };
        });
    }
}
