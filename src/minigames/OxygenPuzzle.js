export default class OxygenPuzzle {
    constructor(manager, workspace) {
        this.manager = manager;
        this.ws = workspace;
        this.targetFreq = 4;
        this.targetAmp = 55;
        this.userFreq = 2;
        this.userAmp = 30;
        this.phase = 0;
    }

    init() {
        document.getElementById('mgInstructions').innerHTML = `
            Match your <strong class="text-cyan-400">Cyan Electrolysis Carrier Wave</strong> to the <strong class="text-emerald-400">Green Reference Harmonic</strong> using the Frequency and Amplitude sliders.
        `;

        this.ws.innerHTML = `
            <div class="space-y-4">
                <canvas id="oxyScopeCanvas" width="560" height="160" class="w-full h-40 bg-slate-950 rounded-xl border border-cyan-500/30 block"></canvas>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                        <div class="flex justify-between text-xs font-mono mb-1.5">
                            <span class="text-slate-300">FREQUENCY HARMONIC</span>
                            <span id="oxyFreqLabel" class="text-cyan-400 font-bold">${this.userFreq} Hz</span>
                        </div>
                        <input id="oxyFreqSlider" type="range" min="1" max="8" step="0.5" value="${this.userFreq}" class="sci-slider" />
                    </div>
                    <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                        <div class="flex justify-between text-xs font-mono mb-1.5">
                            <span class="text-slate-300">AMPLITUDE VOLTAGE</span>
                            <span id="oxyAmpLabel" class="text-cyan-400 font-bold">${this.userAmp} V</span>
                        </div>
                        <input id="oxyAmpSlider" type="range" min="15" max="70" step="5" value="${this.userAmp}" class="sci-slider" />
                    </div>
                </div>
            </div>
        `;

        const canvas = this.ws.querySelector('#oxyScopeCanvas');
        const ctx = canvas.getContext('2d');
        const freqSlider = this.ws.querySelector('#oxyFreqSlider');
        const ampSlider = this.ws.querySelector('#oxyAmpSlider');

        let completed = false;
        const checkLock = () => {
            if (completed) return;
            if (Math.abs(this.userFreq - this.targetFreq) <= 0.5 && Math.abs(this.userAmp - this.targetAmp) <= 5) {
                completed = true;
                this.manager.completeMinigame('(+12% O₂ Saturation Boost)');
            }
        };

        freqSlider.oninput = (e) => {
            this.userFreq = parseFloat(e.target.value);
            this.ws.querySelector('#oxyFreqLabel').textContent = `${this.userFreq} Hz`;
            this.manager.App.audio.playBeep(300 + this.userFreq * 80, 0.04, 'sine', 0.06);
            checkLock();
        };

        ampSlider.oninput = (e) => {
            this.userAmp = parseInt(e.target.value);
            this.ws.querySelector('#oxyAmpLabel').textContent = `${this.userAmp} V`;
            this.manager.App.audio.playBeep(400 + this.userAmp * 5, 0.04, 'sine', 0.06);
            checkLock();
        };

        const drawLoop = () => {
            this.phase += 0.07;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            const midY = canvas.height / 2;

            ctx.beginPath();
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 2.5;
            for (let x = 0; x < canvas.width; x++) {
                const y = midY + Math.sin((x / canvas.width) * Math.PI * 2 * this.targetFreq + this.phase) * this.targetAmp;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.strokeStyle = '#00F0FF';
            ctx.lineWidth = 3;
            for (let x = 0; x < canvas.width; x++) {
                const y = midY + Math.sin((x / canvas.width) * Math.PI * 2 * this.userFreq + this.phase) * this.userAmp;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            if (!completed) {
                this.manager.animFrame = requestAnimationFrame(drawLoop);
            }
        };
        drawLoop();
    }

    destroy() {}
}
