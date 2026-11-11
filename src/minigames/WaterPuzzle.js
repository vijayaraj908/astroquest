export default class WaterPuzzle {
    constructor(manager, workspace) {
        this.manager = manager;
        this.ws = workspace;
        this.stages = [
            { name: 'Pre-Filter Sieve', psi: 35 },
            { name: 'Reverse Osmosis Membrane', psi: 90 },
            { name: 'Catalytic Oxidizer Reactor', psi: 45 },
            { name: 'Ion-Exchange Polishing Bed', psi: 25 }
        ];
    }

    init() {
        document.getElementById('mgInstructions').innerHTML = `
            Adjust all 4 Water Recovery Filtration stages so their pressure sits inside the <strong class="text-emerald-400">Optimal Green Zone (65 - 75 PSI)</strong>.
        `;
        this.render();
    }

    render() {
        this.ws.innerHTML = `
            <div class="space-y-3.5 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                ${this.stages.map((st, idx) => {
                    const inZone = st.psi >= 65 && st.psi <= 75;
                    return `
                        <div class="bg-slate-900/90 border ${inZone ? 'border-emerald-400/60' : 'border-slate-800'} rounded-xl p-3">
                            <div class="flex items-center justify-between text-xs font-mono mb-1.5">
                                <span class="text-white font-semibold">${idx + 1}. ${st.name}</span>
                                <span class="${inZone ? 'text-emerald-400 font-bold' : 'text-amber-300'}">${st.psi} PSI ${inZone ? '[LOCKED]' : '(Target: 65-75)'}</span>
                            </div>
                            <div class="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden mb-2 border border-slate-800">
                                <div class="absolute top-0 bottom-0 left-[65%] w-[10%] bg-emerald-500/35 border-x border-emerald-400"></div>
                                <div class="h-full ${inZone ? 'bg-emerald-400' : 'bg-sky-400'} transition-all" style="width: ${st.psi}%"></div>
                            </div>
                            <input data-valve="${idx}" type="range" min="10" max="100" value="${st.psi}" class="sci-slider valve-slider" />
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.ws.querySelectorAll('.valve-slider').forEach(sl => {
            sl.oninput = (e) => {
                const idx = parseInt(sl.getAttribute('data-valve'));
                this.stages[idx].psi = parseInt(e.target.value);
                this.manager.App.audio.playBeep(400 + this.stages[idx].psi * 3, 0.03, 'sine', 0.05);
                this.render();
                if (this.stages.every(s => s.psi >= 65 && s.psi <= 75)) {
                    this.manager.completeMinigame('(+12L Potable Water Recovered)');
                }
            };
        });
    }
}
