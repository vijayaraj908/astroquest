export class AstronautController {
    constructor(AppInstance) {
        this.App = AppInstance;
        this.reset();
        this.keys = {};
        this.dustParticles = [];
        this.setupInput();
    }

    reset() {
        this.x = 0;
        this.y = 75;
        this.targetX = null;
        this.targetY = null;
        this.angle = -Math.PI / 2;
        this.speed = 210;
        this.walkCycle = 0;
        this.nearestFacility = null;
        this.autoOpenTargetId = null;
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if ((e.code === 'KeyE' || e.code === 'Space') && this.App.state === 'exploration') {
                const modalOpen = !document.getElementById('facilityModal').classList.contains('hidden') ||
                                  !document.getElementById('minigameModal').classList.contains('hidden') ||
                                  !document.getElementById('solSummaryModal').classList.contains('hidden');
                if (!modalOpen && this.nearestFacility) {
                    e.preventDefault();
                    this.App.interactNearestFacility();
                }
            }
            if (e.code === 'Escape') {
                this.App.ui.closeFacilityModal();
                this.App.ui.closeCodexModal();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    moveToFacility(fac, openWhenArrived = true) {
        this.targetX = fac.x;
        this.targetY = fac.y + fac.radius + 16;
        this.autoOpenTargetId = openWhenArrived ? fac.id : null;
    }

    update(dt) {
        if (this.App.state !== 'exploration') return;

        let dx = 0;
        let dy = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

        let moving = false;

        if (dx !== 0 || dy !== 0) {
            this.targetX = null;
            this.targetY = null;
            this.autoOpenTargetId = null;
            const len = Math.hypot(dx, dy);
            dx /= len;
            dy /= len;
            this.x += dx * this.speed * dt;
            this.y += dy * this.speed * dt;
            this.angle = Math.atan2(dy, dx);
            moving = true;
        } else if (this.targetX !== null && this.targetY !== null) {
            const tdx = this.targetX - this.x;
            const tdy = this.targetY - this.y;
            const dist = Math.hypot(tdx, tdy);
            if (dist > 6) {
                this.x += (tdx / dist) * this.speed * dt;
                this.y += (tdy / dist) * this.speed * dt;
                this.angle = Math.atan2(tdy, tdx);
                moving = true;
            } else {
                this.targetX = null;
                this.targetY = null;
                if (this.autoOpenTargetId) {
                    const idToOpen = this.autoOpenTargetId;
                    this.autoOpenTargetId = null;
                    this.App.ui.openFacilityModal(idToOpen);
                }
            }
        }

        this.x = Math.max(-420, Math.min(420, this.x));
        this.y = Math.max(-310, Math.min(310, this.y));

        if (moving) {
            this.walkCycle += dt * 12;
            if (Math.random() < 0.45) {
                this.dustParticles.push({
                    x: this.x + (Math.random() - 0.5) * 10,
                    y: this.y + 10 + (Math.random() - 0.5) * 6,
                    vx: -Math.cos(this.angle) * 18 + (Math.random() - 0.5) * 12,
                    vy: -Math.sin(this.angle) * 18 + (Math.random() - 0.5) * 12,
                    r: Math.random() * 4 + 2,
                    alpha: 0.65
                });
            }
        }

        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const p = this.dustParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.r += dt * 4;
            p.alpha -= dt * 0.9;
            if (p.alpha <= 0) this.dustParticles.splice(i, 1);
        }

        let closest = null;
        let minDist = Infinity;
        this.App.facilities.facilities.forEach(fac => {
            const d = Math.hypot(this.x - fac.x, this.y - fac.y);
            if (d < fac.radius + 52 && d < minDist) {
                minDist = d;
                closest = fac;
            }
        });
        this.nearestFacility = closest;
        this.App.ui.updateProximityPrompt(closest);

        const coordEl = document.getElementById('astronautCoords');
        if (coordEl) {
            coordEl.textContent = `POS: ${Math.round(this.x)}m, ${Math.round(this.y)}m`;
        }
    }
}
