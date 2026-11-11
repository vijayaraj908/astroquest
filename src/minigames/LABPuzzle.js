export default class LABPuzzle {
    constructor(manager, workspace) {
        this.manager = manager;
        this.ws = workspace;
        this.bands = [
            { label: 'Helium-3 Isotope (³He)', val: 30, target: 70, color: 'text-purple-400' },
            { label: 'Hydroxyl Water Ice (OH⁻)', val: 80, target: 40, color: 'text-cyan-400' },
            { label: 'Ilmenite Titanium Oxide (FeTiO₃)', val: 20, target: 60, color: 'text-amber-400' }
        ];
    }

    init() {
        document.getElementById('mgInstructions').innerHTML = `
            Identify the 3 volatile isotopes in the Shackleton Regolith Core by matching each spectral band to its target nanometer peak.
        `;
        this.render();
    }

    render() {
        this.ws.innerHTML = `
            <div class="space-y-4 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                ${this.bands.map((b, i) => {
                    const locked = Math.abs(b.val - b.target) <= 5;
                    return `
                        <div class="bg-slate-900/90 border ${locked ? 'border-emerald-400' : 'border-slate-800'} rounded-xl p-3.5">
                            <div class="flex justify-between text-xs font-mono mb-2">
                                <span class="${b.color} font-bold">${b.label}</span>
                                <span class="${locked ? 'text-emerald-400 font-bold' : 'text-slate-300'}">${b.val}0 nm / Peak: ${b.target}0 nm ${locked ? '✓' : ''}</span>
                            </div>
                            <input data-band="${i}" type="range" min="10" max="90" step="5" value="${b.val}" class="sci-slider band-slider" />
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.ws.querySelectorAll('.band-slider').forEach(sl => {
            sl.oninput = (e) => {
                const idx = parseInt(sl.getAttribute('data-band'));
                this.bands[idx].val = parseInt(e.target.value);
                this.manager.App.audio.playBeep(500 + this.bands[idx].val * 6, 0.04, 'triangle', 0.07);
                this.render();
                if (this.bands.every(b => Math.abs(b.val - b.target) <= 5)) {
                    this.manager.completeMinigame('(+18 Science Data PTS Decoded)');
                }
            };
        });
    }
}
