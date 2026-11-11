export default class CMDPuzzle {
    constructor(manager, workspace) {
        this.manager = manager;
        this.ws = workspace;
        this.relays = [
            { name: 'Goldstone DSN Dish 14 (S-Band)', locked: false },
            { name: 'Madrid DSN Complex (X-Band)', locked: false },
            { name: 'Canberra DSN Lunar Relay (Ka-Band Optical)', locked: false }
        ];
    }

    init() {
        document.getElementById('mgInstructions').innerHTML = `
            Align all 3 Deep Space Network (DSN) transponder channels to transmit Shackleton telemetry packets back to NASA Mission Control in Houston.
        `;
        this.render();
    }

    render() {
        this.ws.innerHTML = `
            <div class="space-y-3 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                ${this.relays.map((r, i) => `
                    <div class="bg-slate-900/90 border ${r.locked ? 'border-cyan-400' : 'border-slate-800'} rounded-xl p-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="fa-solid fa-satellite-dish ${r.locked ? 'text-cyan-400' : 'text-slate-500'} text-xl"></i>
                            <div>
                                <div class="text-xs sm:text-sm font-bold text-white">${r.name}</div>
                                <div class="text-[11px] font-mono ${r.locked ? 'text-emerald-400' : 'text-slate-400'}">${r.locked ? 'TELEMETRY LINK 1.2 Gbps LOCKED' : 'AWAITING TRANSPONDER HANDSHAKE'}</div>
                            </div>
                        </div>
                        <button data-rid="${i}" class="cmd-lock-btn btn-sci px-4 py-2 rounded-lg font-mono text-xs text-cyan-300">
                            ${r.locked ? 'LINKED ✓' : 'LOCK SIGNAL'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        this.ws.querySelectorAll('.cmd-lock-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-rid'));
                if (!this.relays[idx].locked) {
                    this.relays[idx].locked = true;
                    this.manager.App.audio.playBeep(700 + idx * 140, 0.08, 'sine');
                    this.render();
                    if (this.relays.every(r => r.locked)) {
                        this.manager.completeMinigame('(+12 SCI PTS & +8 kWh Grid Optimization)');
                    }
                }
            };
        });
    }
}
