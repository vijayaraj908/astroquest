export default class EVAPuzzle {
    constructor(manager, workspace) {
        this.manager = manager;
        this.ws = workspace;
        this.steps = [
            { step: 1, label: '1. Seal Inner Hatch & Equalize Pressure', done: false },
            { step: 2, label: '2. Electrostatic Regolith Dust Mitigation Sweep', done: false },
            { step: 3, label: '3. Laser-Weld xEMU Suit Micrometeorite Tear', done: false },
            { step: 4, label: '4. Pressurize N₂/O₂ Suit Umbilical Loop', done: false }
        ];
        this.displayOrder = [this.steps[2], this.steps[0], this.steps[3], this.steps[1]];
        this.nextExpected = 1;
    }

    init() {
        document.getElementById('mgInstructions').innerHTML = `
            Execute the 4-stage <strong class="text-amber-300">Airlock Prep & Suit Integrity Sequence</strong> in exact numerical order (STEP 1 → STEP 4).
        `;
        this.render();
    }

    render() {
        this.ws.innerHTML = `
            <div class="space-y-3">
                <div class="text-xs font-mono text-cyan-300 mb-2">NEXT REQUIRED SEQUENCE STEP: <strong class="text-white">STEP #${this.nextExpected}</strong></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${this.displayOrder.map(s => `
                        <button data-step="${s.step}" class="eva-step-btn p-4 rounded-xl border text-left font-mono text-xs transition flex items-center justify-between ${
                            s.done
                                ? 'bg-emerald-950/70 border-emerald-400 text-emerald-300'
                                : 'bg-slate-900 hover:border-cyan-400 border-slate-700 text-slate-200'
                        }">
                            <span>${s.label}</span>
                            <i class="fa-solid ${s.done ? 'fa-circle-check text-emerald-400' : 'fa-circle-dot text-slate-500'} text-base"></i>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        this.ws.querySelectorAll('.eva-step-btn').forEach(btn => {
            btn.onclick = () => {
                const num = parseInt(btn.getAttribute('data-step'));
                const item = this.steps.find(x => x.step === num);
                if (item.done) return;
                if (num === this.nextExpected) {
                    item.done = true;
                    this.nextExpected++;
                    this.manager.App.audio.playBeep(550 + num * 110, 0.08, 'sine');
                    this.render();
                    if (this.nextExpected > 4) {
                        this.manager.completeMinigame('(+10 SCI & +5% Crew Safety)');
                    }
                } else {
                    this.manager.App.audio.playAlert();
                    this.manager.App.ui.showToast(`OUT OF SEQUENCE! EXECUTE STEP #${this.nextExpected} FIRST.`, 'amber');
                }
            };
        });
    }
}
