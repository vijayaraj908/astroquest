import { FACILITY_CONFIGS } from '../data/facilities.js';

export class UIManager {
    constructor(AppInstance) {
        this.App = AppInstance;
        this.toastTimeout = null;
    }

    showToast(msg, tone = 'cyan') {
        const el = document.getElementById('telemetryToast');
        if (!el) return;
        el.textContent = msg;
        el.className = `transition-opacity duration-300 pointer-events-none glass-panel px-4 py-2 rounded-full text-xs font-mono shadow-lg opacity-100 ${
            tone === 'emerald' ? 'text-emerald-300 border-emerald-400' :
            tone === 'amber' ? 'text-amber-300 border-amber-400' :
            tone === 'red' ? 'text-rose-300 border-rose-500' :
            'text-cyan-300 border-cyan-400'
        }`;
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            el.classList.remove('opacity-100');
            el.classList.add('opacity-0');
        }, 3200);
    }

    updateAll() {
        const res = this.App.resources;
        const ops = this.App.dailyOps;
        const facs = this.App.facilities.facilities;
        const deltas = res.computeNetDailyDeltas(facs);

        document.getElementById('hudSolNumber').textContent = String(ops.sol).padStart(2, '0');
        document.getElementById('hudSolText').textContent = `SOL ${ops.sol}`;
        document.getElementById('btnEndSolNum').textContent = ops.sol;
        document.getElementById('hudAPText').textContent = `${ops.ap} / ${ops.maxAp}`;

        const apDots = document.getElementById('hudAPDots');
        apDots.innerHTML = Array.from({ length: ops.maxAp }, (_, i) => `
            <span class="w-4 h-2 rounded-sm transition-all ${i < ops.ap ? 'bg-amber-400 shadow-[0_0_8px_#FFB800]' : 'bg-slate-800'}"></span>
        `).join('');

        document.getElementById('hudCrewHealthVal').textContent = `${Math.round(res.crewHealth)}%`;
        document.getElementById('hudCrewHealthBar').style.width = `${res.crewHealth}%`;

        const fmtD = (v) => `${v >= 0 ? '+' : ''}${v}/d`;

        document.getElementById('hudPowerVal').textContent = Math.round(res.power);
        document.getElementById('hudPowerBar').style.width = `${res.power}%`;
        const pDel = document.getElementById('hudPowerDelta');
        pDel.textContent = fmtD(deltas.power);
        pDel.className = deltas.power >= 0 ? 'text-emerald-400' : 'text-rose-400';

        document.getElementById('hudOxygenVal').textContent = Math.round(res.oxygen);
        document.getElementById('hudOxygenBar').style.width = `${res.oxygen}%`;
        const oDel = document.getElementById('hudOxygenDelta');
        oDel.textContent = fmtD(deltas.oxygen);
        oDel.className = deltas.oxygen >= 0 ? 'text-emerald-400' : 'text-rose-400';

        document.getElementById('hudWaterVal').textContent = Math.round(res.water);
        document.getElementById('hudWaterBar').style.width = `${res.water}%`;
        const wDel = document.getElementById('hudWaterDelta');
        wDel.textContent = fmtD(deltas.water);
        wDel.className = deltas.water >= 0 ? 'text-emerald-400' : 'text-rose-400';

        document.getElementById('hudCO2Val').textContent = Math.round(res.co2);
        const co2Pct = Math.min(100, Math.max(5, ((res.co2 - 350) / 1450) * 100));
        const co2Bar = document.getElementById('hudCO2Bar');
        co2Bar.style.width = `${co2Pct}%`;
        co2Bar.className = `h-full transition-all duration-300 ${res.co2 > 1100 ? 'bg-rose-500' : res.co2 > 800 ? 'bg-amber-400' : 'bg-emerald-400'}`;
        const cDel = document.getElementById('hudCO2Delta');
        cDel.textContent = fmtD(deltas.co2);
        cDel.className = deltas.co2 <= 0 ? 'text-emerald-400' : 'text-rose-400';

        document.getElementById('hudScienceVal').textContent = Math.round(res.science);
        document.getElementById('hudScienceBar').style.width = `${Math.min(100, res.science)}%`;
        document.getElementById('hudScienceDelta').textContent = fmtD(deltas.science);

        const activeEm = this.App.emergencies.getActiveEmergencies();
        const emBanner = document.getElementById('emergencyBanner');
        if (activeEm.length > 0) {
            const first = activeEm[0];
            emBanner.classList.remove('hidden');
            document.getElementById('emergencyBannerText').textContent = `${first.emergencyTitle} (${first.shortName})`;
            document.getElementById('emergencyLocateBtn').onclick = () => {
                this.App.astronaut.moveToFacility(first, true);
            };
        } else {
            emBanner.classList.add('hidden');
        }

        let nom = 0, deg = 0, crit = 0;
        facs.forEach(f => {
            if (f.hasEmergency || f.health < 45) crit++;
            else if (f.health < 75) deg++;
            else nom++;
        });
        document.getElementById('radarNominalCount').textContent = nom;
        document.getElementById('radarDegradedCount').textContent = deg;
        document.getElementById('radarCriticalCount').textContent = crit;

        this.renderQuickDock();
    }

    renderQuickDock() {
        const dock = document.getElementById('facilityQuickDock');
        if (!dock) return;
        dock.innerHTML = this.App.facilities.facilities.map(f => {
            const statusDot = f.hasEmergency
                ? 'bg-rose-500 animate-ping'
                : f.health < 70
                ? 'bg-amber-400'
                : 'bg-emerald-400';
            return `
                <button data-fid="${f.id}" class="quick-doc-btn bg-slate-950/85 hover:bg-slate-900 border ${
                    f.hasEmergency ? 'border-rose-500/80' : f.calibratedToday ? 'border-emerald-400/60' : 'border-slate-800 hover:border-cyan-400/60'
                } rounded-lg p-1.5 flex flex-col items-center justify-center transition relative group">
                    <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${statusDot}"></span>
                    <i class="fa-solid ${f.icon} text-sm mb-1" style="color: ${f.color}"></i>
                    <span class="font-mono text-[10px] text-slate-200 font-semibold truncate w-full text-center">${f.shortName}</span>
                    <span class="font-mono text-[9px] text-slate-400">${f.health}%</span>
                </button>
            `;
        }).join('');

        dock.querySelectorAll('.quick-doc-btn').forEach(b => {
            b.onclick = () => {
                this.App.selectAndMoveToFacility(b.getAttribute('data-fid'));
            };
        });
    }

    updateProximityPrompt(fac) {
        const btn = document.getElementById('proximityPromptBtn');
        const lbl = document.getElementById('proximityPromptLabel');
        if (!fac) {
            btn.classList.add('hidden');
        } else {
            btn.classList.remove('hidden');
            lbl.textContent = `INSPECT ${fac.name.toUpperCase()}`;
        }
    }

    openFacilityModal(facilityId) {
        this.App.facilities.selectedFacilityId = facilityId;
        const fac = this.App.facilities.getById(facilityId);
        if (!fac) return;
        this.App.audio.playClick();

        document.getElementById('facModalCode').textContent = `${fac.code} // LEVEL ${fac.level}`;
        document.getElementById('facModalTitle').textContent = fac.name;
        document.getElementById('facModalDesc').textContent = fac.description;
        document.getElementById('facModalIcon').className = `fa-solid ${fac.icon}`;

        const statusBadge = document.getElementById('facModalStatusBadge');
        if (fac.hasEmergency) {
            statusBadge.textContent = 'CRITICAL ANOMALY';
            statusBadge.className = 'px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold';
        } else if (fac.health < 70) {
            statusBadge.textContent = 'DEGRADED // MAINTENANCE ADVISED';
            statusBadge.className = 'px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold';
        } else {
            statusBadge.textContent = 'ONLINE // NOMINAL';
            statusBadge.className = 'px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold';
        }

        const emBox = document.getElementById('facModalEmergencyBox');
        if (fac.hasEmergency) {
            emBox.classList.remove('hidden');
            document.getElementById('facModalEmergencyTitle').textContent = fac.emergencyTitle.toUpperCase();
            document.getElementById('facModalEmergencyDesc').textContent = fac.emergencyDesc;
        } else {
            emBox.classList.add('hidden');
        }

        document.getElementById('facModalHealthText').textContent = `${fac.health}%`;
        document.getElementById('facModalHealthBar').style.width = `${fac.health}%`;

        const effMult = Math.round(fac.efficiency * (fac.calibratedToday ? 1.25 : 1.0) * 100);
        document.getElementById('facModalEffText').textContent = `${effMult}% (Lv.${fac.level})`;
        document.getElementById('facModalEffBar').style.width = `${Math.min(100, effMult / 2)}%`;

        const calTag = document.getElementById('facModalCalibratedTag');
        if (fac.calibratedToday) calTag.classList.remove('hidden');
        else calTag.classList.add('hidden');

        const outList = document.getElementById('facModalOutputList');
        const mult = (fac.health / 100) * fac.efficiency * (fac.calibratedToday ? 1.25 : 1.0) * (fac.hasEmergency ? 0.45 : 1.0);
        const items = [];
        if (fac.baseOutputs.power) {
            const v = fac.baseOutputs.power > 0 ? Math.round(fac.baseOutputs.power * mult) : fac.baseOutputs.power;
            items.push(`<div class="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between"><span>Power:</span><span class="${v >= 0 ? 'text-amber-300' : 'text-slate-400'}">${v >= 0 ? '+' : ''}${v} kWh/Sol</span></div>`);
        }
        if (fac.baseOutputs.oxygen) {
            const v = Math.round(fac.baseOutputs.oxygen * mult);
            items.push(`<div class="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between"><span>Oxygen:</span><span class="text-cyan-300">+${v}%/Sol</span></div>`);
        }
        if (fac.baseOutputs.water) {
            const v = fac.baseOutputs.water > 0 ? Math.round(fac.baseOutputs.water * mult) : fac.baseOutputs.water;
            items.push(`<div class="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between"><span>Water:</span><span class="${v >= 0 ? 'text-sky-300' : 'text-slate-400'}">${v >= 0 ? '+' : ''}${v} L/Sol</span></div>`);
        }
        if (fac.baseOutputs.co2) {
            const v = Math.round(fac.baseOutputs.co2 * mult);
            items.push(`<div class="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between"><span>CO₂ Scrub:</span><span class="text-emerald-400">${v} ppm/Sol</span></div>`);
        }
        if (fac.baseOutputs.science) {
            const v = Math.round(fac.baseOutputs.science * mult);
            items.push(`<div class="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between"><span>Science:</span><span class="text-purple-300">+${v} PTS/Sol</span></div>`);
        }
        if (fac.baseOutputs.crewHeal) {
            const v = Math.round(fac.baseOutputs.crewHeal * mult);
            items.push(`<div class="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between"><span>Crew Care:</span><span class="text-rose-300">+${v}% Vitality/Sol</span></div>`);
        }
        outList.innerHTML = items.join('');

        document.getElementById('upgradeCostLabel').textContent = `Costs ${fac.level * 25} SCI PTS`;
        document.getElementById('facilityModal').classList.remove('hidden');
    }

    closeFacilityModal() {
        document.getElementById('facilityModal').classList.add('hidden');
    }

    openCodexModal() {
        this.App.audio.playClick();
        const grid = document.getElementById('codexFacilitiesGrid');
        grid.innerHTML = FACILITY_CONFIGS.map(f => `
            <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <div class="flex items-center gap-2.5 mb-1.5">
                    <div class="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center" style="color: ${f.color}">
                        <i class="fa-solid ${f.icon}"></i>
                    </div>
                    <div>
                        <div class="text-[10px] font-mono text-slate-400">${f.code}</div>
                        <div class="font-display font-bold text-xs text-white">${f.name}</div>
                    </div>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed mb-2">${f.description}</p>
                <div class="text-[11px] font-mono text-cyan-300">Minigame: ${f.minigameTitle}</div>
            </div>
        `).join('');
        document.getElementById('codexModal').classList.remove('hidden');
    }

    closeCodexModal() {
        document.getElementById('codexModal').classList.add('hidden');
    }
}
