import './style.css';
import { ResourceManager } from './systems/ResourceManager.js';
import { FacilityManager } from './systems/FacilityManager.js';
import { EmergencyManager } from './systems/EmergencyManager.js';
import { AstronautController } from './systems/AstronautController.js';
import { DailyOperationsManager } from './systems/DailyOperationsManager.js';
import { MiniGameManager } from './systems/MiniGameManager.js';
import { UIManager } from './ui/UIManager.js';

class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        const icon = document.getElementById('audioIcon');
        const label = document.getElementById('audioLabel');
        if (this.muted) {
            icon.className = 'fa-solid fa-volume-xmark text-rose-400';
            label.textContent = 'AUDIO: MUTED';
        } else {
            this.init();
            icon.className = 'fa-solid fa-volume-high text-cyan-400';
            label.textContent = 'AUDIO: ON';
            this.playBeep(660, 0.08, 'sine');
        }
    }

    playBeep(freq = 520, duration = 0.08, type = 'sine', vol = 0.12) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    playClick() { this.playBeep(780, 0.05, 'triangle', 0.1); }
    playSuccess() {
        if (this.muted) return;
        this.init();
        [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
            setTimeout(() => this.playBeep(f, 0.14, 'sine', 0.14), idx * 75);
        });
    }
    playAlert() {
        if (this.muted) return;
        this.init();
        [320, 240, 320].forEach((f, idx) => {
            setTimeout(() => this.playBeep(f, 0.18, 'sawtooth', 0.12), idx * 140);
        });
    }
}

const App = {
    state: 'menu',
    audio: new SoundManager(),
    resources: new ResourceManager(),
    facilities: new FacilityManager(),
    emergencies: null,
    astronaut: null,
    camera: { x: 0, y: 0 },
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
    dailyOps: null,
    minigames: null,
    ui: null,

    canvas: null,
    ctx: null,
    minimapCanvas: null,
    minimapCtx: null,
    stars: [],
    craters: [],
    lastTime: 0,
    radarAngle: 0,
    pulseTime: 0,
    typewriterTimer: null,

    init() {
        this.emergencies = new EmergencyManager(this);
        this.astronaut = new AstronautController(this);
        this.dailyOps = new DailyOperationsManager(this);
        this.minigames = new MiniGameManager(this);
        this.ui = new UIManager(this);

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.stars = Array.from({ length: 160 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.7 + 0.4,
            twinkle: Math.random() * Math.PI * 2
        }));

        this.craters = [
            { x: -340, y: -230, r: 46 },
            { x: 350, y: -240, r: 54 },
            { x: -370, y: 210, r: 48 },
            { x: 360, y: 215, r: 40 },
            { x: -120, y: -95, r: 28 },
            { x: 135, y: 95, r: 32 },
            { x: 10, y: 145, r: 24 }
        ];

        
        this.canvas.addEventListener('pointerdown', (e) => {
            if (this.state !== 'exploration') return;
            if (this.isDragging) { this.isDragging = false; return; }
            this.isDragging = false;
            this.lastMouse = { x: e.clientX, y: e.clientY };
        });
        
        this.canvas.addEventListener('pointermove', (e) => {
            if (this.state !== 'exploration' || e.buttons !== 1) return;
            const dx = e.clientX - this.lastMouse.x;
            const dy = e.clientY - this.lastMouse.y;
            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                this.isDragging = true;
                // Move camera in opposite direction of drag to simulate dragging the ground
                this.camera.x += dx / this.getWorldScale();
                this.camera.y += dy / this.getWorldScale();
                
                // Limit camera bounds so they don't wander off into deep space
                this.camera.x = Math.max(-250, Math.min(250, this.camera.x));
                this.camera.y = Math.max(-250, Math.min(250, this.camera.y));
            }
            this.lastMouse = { x: e.clientX, y: e.clientY };
        });
    
        this.canvas.addEventListener('pointerup', (e) => {
            if (this.state !== 'exploration') return;
            if (this.isDragging) { this.isDragging = false; return; }
            const rect = this.canvas.getBoundingClientRect();
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2 + 25;
            const scale = this.getWorldScale();

            const worldX = (e.clientX - rect.left - cx) / scale - this.camera.x;
            const worldY = (e.clientY - rect.top - cy) / scale - this.camera.y;

            let clickedFac = null;
            for (const fac of this.facilities.facilities) {
                if (Math.hypot(worldX - fac.x, worldY - fac.y) <= fac.radius + 10) {
                    clickedFac = fac;
                    break;
                }
            }

            if (clickedFac) {
                this.selectAndMoveToFacility(clickedFac.id);
            } else {
                this.astronaut.targetX = Math.max(-420, Math.min(420, worldX));
                this.astronaut.targetY = Math.max(-310, Math.min(310, worldY));
                this.astronaut.autoOpenTargetId = null;
            }
        });

        this.setupDOMEventListeners();

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    setupDOMEventListeners() {
        document.getElementById('btnAudioToggle').onclick = () => this.audio.toggleMute();
        document.getElementById('btnCodexTop').onclick = () => this.ui.openCodexModal();
        document.getElementById('btnCodexMenu').onclick = () => this.ui.openCodexModal();
        document.getElementById('btnBriefingLaunch').onclick = () => this.startMissionWithBriefing();
        document.getElementById('btnQuickDeploy').onclick = () => this.startImmediateMission();
        document.getElementById('btnBackToMenu').onclick = () => this.showScene('menu');
        document.getElementById('btnStartFromBriefing').onclick = () => this.startImmediateMission();
        document.getElementById('btnCloseFacModal').onclick = () => this.ui.closeFacilityModal();
        document.getElementById('btnCloseFacModalBottom').onclick = () => this.ui.closeFacilityModal();
        document.getElementById('btnLaunchMinigame').onclick = () => this.minigames.launchForCurrentFacility();
        document.getElementById('btnQuickRepair').onclick = () => this.facilities.repairCurrentFacility(this);
        document.getElementById('btnUpgradeFacility').onclick = () => this.facilities.upgradeCurrentFacility(this);
        document.getElementById('btnCloseMinigame').onclick = () => this.minigames.closeMinigame();
        document.getElementById('btnAbortMinigame').onclick = () => this.minigames.closeMinigame();
        document.getElementById('btnEndSolModal').onclick = () => this.dailyOps.openEndSolConfirmation();
        document.getElementById('btnConfirmNextSol').onclick = () => this.dailyOps.confirmNextSol();
        document.getElementById('btnRestartMission').onclick = () => this.startImmediateMission();
        document.getElementById('btnReturnMenuGameOver').onclick = () => this.showScene('menu');
        document.getElementById('btnCloseCodex').onclick = () => this.ui.closeCodexModal();
        document.getElementById('btnCloseCodexBottom').onclick = () => this.ui.closeCodexModal();
    },

    getWorldScale() {
        const minDim = Math.min(this.canvas.width / 960, this.canvas.height / 720);
        return Math.max(0.52, Math.min(1.15, minDim));
    },

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    showScene(sceneName) {
        this.state = sceneName;
        document.getElementById('menuScene').classList.toggle('hidden', sceneName !== 'menu');
        document.getElementById('briefingScene').classList.toggle('hidden', sceneName !== 'briefing');
        document.getElementById('explorationHUD').classList.toggle('hidden', sceneName !== 'exploration');
        document.getElementById('gameOverModal').classList.add('hidden');
    },

    startMissionWithBriefing() {
        this.audio.playClick();
        this.showScene('briefing');
        const text = [
            `> INCOMING TRANSMISSION: NASA ARTEMIS DIRECTORATE // HOUSTON`,
            `> DESTINATION: SHACKLETON CRATER RIM OUTPOST (LUNAR SOUTH POLE)`,
            `> MISSION DURATION: 5 SOLAR DAYS (SOL 1 TO SOL 5)`,
            ``,
            `COMMANDER, YOUR 4-ASTRONAUT CREW HAS TOUCHED DOWN AT BASE ALPHA.`,
            `OUR 8 INTERCONNECTED HABITAT & LIFE-SUPPORT MODULES SUSTAIN CREW VITALITY:`,
            `  • SOLAR ARRAY & GRID HUB: Generates daily kWh electrical power.`,
            `  • WATER RECOVERY & O₂ ASSEMBLY: Recycles H₂O & electrolyzes breathable O₂.`,
            `  • BIO-REGENERATIVE CO₂ MODULE: Scrubs toxic CO₂ ppm from cabin air.`,
            `  • SCIENCE LAB, EVA AIRLOCK & CREW MED-BAY: Research upgrades & heal crew.`,
            ``,
            `OPERATIONAL DIRECTIVE: Walk the lunar surface, inspect facilities, and run Calibration Minigames (4 AP per Sol) to counter regolith degradation and solar anomalies!`
        ].join('\n');

        const el = document.getElementById('briefingTypewriter');
        el.textContent = '';
        clearInterval(this.typewriterTimer);
        let idx = 0;
        this.typewriterTimer = setInterval(() => {
            if (idx < text.length) {
                el.textContent += text[idx];
                idx++;
            } else {
                clearInterval(this.typewriterTimer);
            }
        }, 12);
    },

    startImmediateMission() {
        clearInterval(this.typewriterTimer);
        this.audio.playSuccess();
        this.resources.reset();
        this.facilities.reset();
        this.dailyOps.reset();
        this.astronaut.reset();
        this.showScene('exploration');
        this.ui.updateAll();
        this.ui.showToast('SOL 1 INITIALIZED // CLICK ANY MODULE OR USE WASD TO EXPLORE', 'cyan');
    },

    selectAndMoveToFacility(facilityId) {
        const fac = this.facilities.getById(facilityId);
        if (!fac) return;
        this.audio.playClick();
        const dist = Math.hypot(this.astronaut.x - fac.x, this.astronaut.y - fac.y);
        if (dist <= fac.radius + 58) {
            this.ui.openFacilityModal(fac.id);
        } else {
            this.astronaut.moveToFacility(fac, true);
        }
    },

    interactNearestFacility() {
        if (this.astronaut.nearestFacility) {
            this.ui.openFacilityModal(this.astronaut.nearestFacility.id);
        }
    },

    triggerGameOver(victory, reasonText) {
        if (victory) this.audio.playSuccess();
        else this.audio.playAlert();

        const modal = document.getElementById('gameOverModal');
        const iconWrap = document.getElementById('endModalIconWrap');
        const icon = document.getElementById('endModalIcon');
        const title = document.getElementById('endModalTitle');
        const desc = document.getElementById('endModalDesc');
        const stats = document.getElementById('endModalStats');

        if (victory) {
            iconWrap.className = 'w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl border bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.4)]';
            icon.className = 'fa-solid fa-medal';
            title.textContent = '10-SOL ARTEMIS MISSION ACCOMPLISHED!';
        } else {
            iconWrap.className = 'w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl border bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]';
            icon.className = 'fa-solid fa-triangle-exclamation';
            title.textContent = 'MISSION ABORTED // LIFE SUPPORT CRITICAL';
        }

        desc.textContent = reasonText;

        const score = Math.round(
            this.dailyOps.sol * 100 +
            this.resources.crewHealth * 5 +
            this.resources.science * 4 +
            this.resources.power * 2
        );

        stats.innerHTML = `
            <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div class="text-[10px] text-slate-400">SOLS SURVIVED</div>
                <div class="text-base font-bold text-cyan-300">${this.dailyOps.sol} / 10</div>
            </div>
            <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div class="text-[10px] text-slate-400">CREW VITALITY</div>
                <div class="text-base font-bold text-emerald-400">${Math.round(this.resources.crewHealth)}%</div>
            </div>
            <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div class="text-[10px] text-slate-400">SCIENCE DATA</div>
                <div class="text-base font-bold text-purple-300">${this.resources.science} PTS</div>
            </div>
            <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div class="text-[10px] text-slate-400">NASA RATING</div>
                <div class="text-base font-bold text-amber-300">${score} PTS</div>
            </div>
        `;

        modal.classList.remove('hidden');
    },

    loop(timestamp) {
        const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;
        this.pulseTime += dt;
        this.radarAngle = (this.radarAngle + dt * 2.2) % (Math.PI * 2);

        if (this.state === 'exploration') {
            this.astronaut.update(dt);
            this.renderExplorationCanvas();
            this.renderMinimap();
        } else {
            this.renderMenuStarfield();
        }

        requestAnimationFrame((t) => this.loop(t));
    },

    renderMenuStarfield() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.fillStyle = '#04070F';
        ctx.fillRect(0, 0, w, h);

        this.stars.forEach(s => {
            const alpha = 0.4 + 0.6 * Math.sin(this.pulseTime * 2 + s.twinkle);
            ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
            ctx.fill();
        });

        const grad = ctx.createRadialGradient(w * 0.5, h * 1.35, h * 0.1, w * 0.5, h * 1.35, h * 0.75);
        grad.addColorStop(0, '#334155');
        grad.addColorStop(0.6, '#1E293B');
        grad.addColorStop(1, 'rgba(4, 7, 15, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 1.35, h * 0.72, 0, Math.PI * 2);
        ctx.fill();
    },

    renderExplorationCanvas() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const bgGrad = ctx.createRadialGradient(w / 2, h / 2 + 25, 40, w / 2, h / 2 + 25, Math.max(w, h) * 0.75);
        bgGrad.addColorStop(0, '#1E2638');
        bgGrad.addColorStop(0.55, '#111726');
        bgGrad.addColorStop(1, '#050811');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        this.stars.forEach((s, idx) => {
            if (idx % 2 === 0) {
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.fillRect(s.x * w, s.y * h * 0.25, 1.5, 1.5);
            }
        });

        const cx = w / 2;
        const cy = h / 2 + 25;
        const scale = this.getWorldScale();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.translate(this.camera.x * scale, this.camera.y * scale);
        ctx.scale(scale, scale);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.ellipse(0, 0, 435, 315, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        this.craters.forEach(c => {
            ctx.fillStyle = 'rgba(7, 11, 20, 0.65)';
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, c.r, c.r * 0.68, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        const cmd = this.facilities.getById('CMD');
        this.facilities.facilities.forEach(fac => {
            if (fac.id === 'CMD') return;
            ctx.strokeStyle = fac.hasEmergency ? 'rgba(252, 61, 33, 0.6)' : 'rgba(0, 240, 255, 0.28)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(cmd.x, cmd.y);
            ctx.lineTo(fac.x, fac.y);
            ctx.stroke();

            const t = (this.pulseTime * 0.55 + (fac.x + 300) * 0.001) % 1;
            const px = cmd.x + (fac.x - cmd.x) * t;
            const py = cmd.y + (fac.y - cmd.y) * t;
            ctx.fillStyle = fac.hasEmergency ? '#FC3D21' : fac.color;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        if (this.astronaut.targetX !== null && this.astronaut.targetY !== null) {
            ctx.strokeStyle = '#00F0FF';
            ctx.lineWidth = 2;
            const r = 8 + Math.sin(this.pulseTime * 8) * 3;
            ctx.beginPath();
            ctx.arc(this.astronaut.targetX, this.astronaut.targetY, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        this.facilities.facilities.forEach(fac => {
            const isNearest = this.astronaut.nearestFacility && this.astronaut.nearestFacility.id === fac.id;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.beginPath();
            ctx.ellipse(fac.x, fac.y + 10, fac.radius + 4, (fac.radius + 4) * 0.72, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = fac.hasEmergency
                ? '#FC3D21'
                : isNearest
                ? '#00F0FF'
                : fac.calibratedToday
                ? '#00E676'
                : 'rgba(148, 163, 184, 0.45)';
            ctx.lineWidth = isNearest || fac.hasEmergency ? 3.5 : 2;
            ctx.beginPath();
            ctx.arc(fac.x, fac.y, fac.radius + 6, 0, Math.PI * 2);
            ctx.stroke();

            const domeGrad = ctx.createRadialGradient(fac.x - 10, fac.y - 12, 4, fac.x, fac.y, fac.radius);
            domeGrad.addColorStop(0, '#334155');
            domeGrad.addColorStop(0.7, '#0F172A');
            domeGrad.addColorStop(1, '#090D16');
            ctx.fillStyle = domeGrad;
            ctx.beginPath();
            ctx.arc(fac.x, fac.y, fac.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = fac.color;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            if (fac.id === 'SOLAR') {
                ctx.fillStyle = '#1D4ED8';
                ctx.strokeStyle = '#60A5FA';
                ctx.lineWidth = 1.5;
                ctx.fillRect(fac.x - 68, fac.y - 12, 20, 24);
                ctx.strokeRect(fac.x - 68, fac.y - 12, 20, 24);
                ctx.fillRect(fac.x + 48, fac.y - 12, 20, 24);
                ctx.strokeRect(fac.x + 48, fac.y - 12, 20, 24);
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '700 11px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(fac.shortName.toUpperCase(), fac.x, fac.y + 4);

            ctx.fillStyle = 'rgba(4, 7, 15, 0.85)';
            ctx.fillRect(fac.x - 34, fac.y + fac.radius - 6, 68, 16);
            ctx.strokeStyle = fac.hasEmergency ? '#FC3D21' : fac.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(fac.x - 34, fac.y + fac.radius - 6, 68, 16);

            ctx.fillStyle = fac.hasEmergency ? '#FCA5A5' : fac.calibratedToday ? '#6EE7B7' : '#E2E8F0';
            ctx.font = '600 9.5px "JetBrains Mono", monospace';
            ctx.fillText(fac.hasEmergency ? 'ALERT!' : `${fac.health}% NOM`, fac.x, fac.y + fac.radius + 5);
        });

        this.astronaut.dustParticles.forEach(p => {
            ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        const ax = this.astronaut.x;
        const ay = this.astronaut.y;
        const ang = this.astronaut.angle;

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(ang);
        const beamGrad = ctx.createLinearGradient(0, 0, 95, 0);
        beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
        beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(95, -34);
        ctx.lineTo(95, 34);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(-12, -8, 10, 16);

        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(3, 0, 6.5, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    },

    renderMinimap() {
        const ctx = this.minimapCtx;
        if (!ctx) return;
        const w = this.minimapCanvas.width;
        const h = this.minimapCanvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
        ctx.lineWidth = 1;
        [22, 42, 56].forEach(r => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        });

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(this.radarAngle) * 58, cy + Math.sin(this.radarAngle) * 58);
        ctx.stroke();

        this.facilities.facilities.forEach(f => {
            const mx = cx + (f.x / 450) * 52;
            const my = cy + (f.y / 340) * 52;
            ctx.fillStyle = f.hasEmergency ? '#FC3D21' : f.health < 70 ? '#FFB800' : '#00E676';
            ctx.beginPath();
            ctx.arc(mx, my, f.hasEmergency ? 4.2 : 3, 0, Math.PI * 2);
            ctx.fill();
        });

        const ax = cx + (this.astronaut.x / 450) * 52;
        const ay = cy + (this.astronaut.y / 340) * 52;
        ctx.fillStyle = '#00F0FF';
        ctx.beginPath();
        ctx.arc(ax, ay, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }
};

window.onload = () => {
    App.init();
};
