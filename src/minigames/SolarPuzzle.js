export default class SolarPuzzle {
    constructor(manager, workspace) {
        this.manager = manager;
        this.ws = workspace;
        this.targetAngle = Math.floor(Math.random() * 50) + 20;
        this.cells = Array.from({ length: 8 }, (_, i) => ({ id: i, dirty: true }));
        this.currentAngle = 5;
    }

    init() {
        document.getElementById('mgInstructions').innerHTML = `
            <strong>STEP 1:</strong> Click all 8 dust-covered photovoltaic cells below to clear electrostatic regolith.<br>
            <strong>STEP 2:</strong> Align the Array Tilt Slider to match the Shackleton solar incidence angle (<strong class="text-amber-300">${this.targetAngle}°</strong>).
        `;
        this.render();
    }

    render() {
        const cleanCount = this.cells.filter(c => !c.dirty).length;
        const angleDiff = Math.abs(this.currentAngle - this.targetAngle);
        const angleAligned = angleDiff <= 2;

        this.ws.innerHTML = `
            <div class="space-y-4 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                <div class="flex items-center justify-between text-xs font-mono">
                    <span class="text-amber-300">CLEANED CELLS: ${cleanCount} / 8</span>
                    <span class="${angleAligned ? 'text-emerald-400 font-bold' : 'text-cyan-300'}">SOLAR LOCK: ${this.currentAngle}° (TARGET: ${this.targetAngle}°)</span>
                </div>
                <div class="grid grid-cols-4 gap-2.5">
                    ${this.cells.map(c => `
                        <button data-cell="${c.id}" class="solar-cell-btn h-20 rounded-xl border transition-all flex flex-col items-center justify-center relative overflow-hidden ${
                            c.dirty
                                ? 'bg-stone-800/90 border-amber-500/40 text-stone-300 hover:border-amber-400'
                                : 'bg-sky-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                        }">
                            <i class="fa-solid ${c.dirty ? 'fa-smog text-amber-400/80' : 'fa-solar-panel text-cyan-400'} text-xl mb-1"></i>
                            <span class="font-mono text-[10px] font-bold">${c.dirty ? 'DUST COATED' : '100% CLEAN'}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                    <div class="flex justify-between text-xs font-mono mb-2">
                        <span class="text-slate-300">PHOTOVOLTAIC GIMBAL TILT ANGLE</span>
                        <span class="text-amber-400 font-bold">${this.currentAngle}° / Target ${this.targetAngle}°</span>
                    </div>
                    <input id="solarAngleSlider" type="range" min="0" max="80" value="${this.currentAngle}" class="sci-slider" />
                </div>
            </div>
        `;

        this.ws.querySelectorAll('.solar-cell-btn').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-cell'));
                if (this.cells[id].dirty) {
                    this.cells[id].dirty = false;
                    this.manager.App.audio.playBeep(680, 0.06, 'triangle');
                    this.checkDone();
                    this.render();
                }
            };
        });

        const slider = this.ws.querySelector('#solarAngleSlider');
        if (slider) {
            slider.oninput = (e) => {
                this.currentAngle = parseInt(e.target.value);
                this.manager.App.audio.playBeep(300 + this.currentAngle * 5, 0.03, 'sine', 0.05);
                this.checkDone();
                this.render();
            };
        }
    }

    checkDone() {
        const allClean = this.cells.every(c => !c.dirty);
        const aligned = Math.abs(this.currentAngle - this.targetAngle) <= 2;
        if (allClean && aligned) {
            this.manager.completeMinigame('(+14 kWh Instant Surge)');
        }
    }
}
