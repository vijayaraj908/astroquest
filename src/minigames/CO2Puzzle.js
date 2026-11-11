export default class CO2Puzzle {
    constructor(manager, workspace) {
        this.manager = manager;
        this.ws = workspace;
        this.cells = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            saturated: i % 2 === 0 || i === 3 || i === 9
        }));
    }

    init() {
        document.getElementById('mgInstructions').innerHTML = `
            Click all <strong class="text-rose-400">Red Saturated Zeolite Cells</strong> in the 12-cell bioreactor matrix to thermal-vent trapped CO₂ gas into space.
        `;
        this.render();
    }

    render() {
        const remaining = this.cells.filter(c => c.saturated).length;
        this.ws.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between text-xs font-mono">
                    <span class="text-emerald-400">BIOREACTOR O₂ LOOP: ACTIVE</span>
                    <span class="text-rose-400 font-bold">SATURATED CELLS REMAINING: ${remaining}</span>
                </div>
                <div class="grid grid-cols-4 gap-3">
                    ${this.cells.map(c => `
                        <button data-cid="${c.id}" class="co2-cell h-20 rounded-xl border font-mono text-xs flex flex-col items-center justify-center gap-1 transition ${
                            c.saturated
                                ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse hover:bg-rose-900'
                                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        }">
                            <i class="fa-solid ${c.saturated ? 'fa-fire-flame-curved text-rose-400' : 'fa-leaf text-emerald-400'} text-lg"></i>
                            <span>${c.saturated ? 'CO₂ FULL - PURGE' : 'SCRUBBER NOMINAL'}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        this.ws.querySelectorAll('.co2-cell').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-cid'));
                if (this.cells[id].saturated) {
                    this.cells[id].saturated = false;
                    this.manager.App.audio.playBeep(720, 0.07, 'sine');
                    this.render();
                    if (this.cells.every(c => !c.saturated)) {
                        this.manager.completeMinigame('(-140 ppm Cabin CO₂ Purged)');
                    }
                }
            };
        });
    }
}
