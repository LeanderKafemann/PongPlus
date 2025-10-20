/**
 * UIManager - screen switching, polaroid, small helpers (v1.4.2) - FIXED
 *
 * - Added onToggleArcade(callback)
 * - Added activateDiscoMode() and toast()
 * - Ensures only one screen visible at a time (hideAll)
 */

export class UIManager {
    private startCb: (() => void) | null = null;
    private showLeaderboardCb: (() => void) | null = null;
    private saveScoreCb: (() => void) | null = null;
    private backToMenuCb: (() => void) | null = null;
    private toggleArcadeCb: ((v: boolean) => void) | null = null;

    constructor(private controllerRef?: any) {
        // wire basic UI buttons
        document.getElementById('startBtn')?.addEventListener('click', () => this.startCb && this.startCb());
        document.getElementById('leaderboardBtn')?.addEventListener('click', () => this.showLeaderboardCb && this.showLeaderboardCb());
        document.getElementById('saveScoreBtn')?.addEventListener('click', () => this.saveScoreCb && this.saveScoreCb());
        document.getElementById('backBtn')?.addEventListener('click', () => this.backToMenuCb && this.backToMenuCb());
        document.getElementById('menuBtn')?.addEventListener('click', () => this.backToMenuCb && this.backToMenuCb());

        const arcadeEl = document.getElementById('arcadeToggle') as HTMLInputElement | null;
        if (arcadeEl) {
            arcadeEl.addEventListener('change', () => {
                const checked = arcadeEl.checked;
                if (this.toggleArcadeCb) this.toggleArcadeCb(checked);
            });
        }
    }

    onStart(cb: () => void) { this.startCb = cb; }
    onShowLeaderboard(cb: () => void) { this.showLeaderboardCb = cb; }
    onSaveScore(cb: () => void) { this.saveScoreCb = cb; }
    onBackToMenu(cb: () => void) { this.backToMenuCb = cb; }
    onToggleArcade(cb: (v: boolean) => void) { this.toggleArcadeCb = cb; }

    showMenu() {
        this.hideAll();
        document.getElementById('menu')?.classList.remove('hidden');
    }

    showGame() {
        this.hideAll();
        document.getElementById('gameContainer')?.classList.remove('hidden');
    }

    showLeaderboard() {
        this.hideAll();
        document.getElementById('leaderboard')?.classList.remove('hidden');
    }

    showGameOver(won: boolean, pScore: number, aiScore: number) {
        this.hideAll();
        document.getElementById('gameOver')?.classList.remove('hidden');
        document.getElementById('gameOverTitle')!.textContent = won ? '🎉 You Win!' : '😢 You Lose!';
        document.getElementById('finalScore')!.textContent = `Final Score: ${pScore} - ${aiScore}`;
    }

    hideAll() {
        document.getElementById('menu')?.classList.add('hidden');
        document.getElementById('gameContainer')?.classList.add('hidden');
        document.getElementById('leaderboard')?.classList.add('hidden');
        document.getElementById('gameOver')?.classList.add('hidden');
    }

    displaySelectedAbilities(abilities: any[]) {
        const container = document.getElementById('abilityDisplay');
        if (!container) return;
        container.innerHTML = abilities.map(a => `<div class="ability-badge" style="background:${a.color};padding:6px;border-radius:6px;color:#000">${a.icon} ${a.name} (${a.key})</div>`).join('');
    }

    updateScore(p: number, a: number) {
        document.getElementById('playerScore')!.textContent = String(p);
        document.getElementById('aiScore')!.textContent = String(a);
    }

    getPlayerName(): string | null {
        const el = document.getElementById('playerName') as HTMLInputElement | null;
        return el ? el.value.trim() : null;
    }

    isArcade(): boolean {
        const tick = document.getElementById('arcadeToggle') as HTMLInputElement | null;
        return !!(tick && tick.checked);
    }

    takePolaroid(canvas: HTMLCanvasElement) {
        let flash = document.getElementById('polaroidFlash') as HTMLDivElement | null;
        if (!flash) {
            flash = document.createElement('div');
            flash.id = 'polaroidFlash';
            flash.className = 'polaroid-flash';
            document.body.appendChild(flash);
        }
        flash.classList.add('show');
        setTimeout(() => flash && flash.classList.remove('show'), 160);

        try {
            const data = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = data;
            a.download = `pongplus-polaroid-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            let hint = document.getElementById('polaroidHint') as HTMLDivElement | null;
            if (!hint) {
                hint = document.createElement('div');
                hint.id = 'polaroidHint';
                hint.className = 'polaroid-hint';
                hint.textContent = 'Photo saved!';
                document.body.appendChild(hint);
            }
            hint.classList.add('show');
            setTimeout(() => hint && hint.classList.remove('show'), 2500);
        } catch (err) {
            console.warn('Polaroid failed', err);
            alert('Snapshot failed in this browser.');
        }
    }

    activateDiscoMode() {
        document.body.classList.add('disco-mode');
        const disco = document.createElement('div');
        disco.id = 'discoBall';
        disco.className = 'disco-ball';
        document.body.appendChild(disco);
        setTimeout(() => {
            document.body.classList.remove('disco-mode');
            const el = document.getElementById('discoBall');
            if (el) el.remove();
        }, 10000);
    }

    toast(msg: string) {
        let t = document.getElementById('uiToast') as HTMLDivElement | null;
        if (!t) {
            t = document.createElement('div');
            t.id = 'uiToast';
            t.style.position = 'fixed';
            t.style.left = '50%';
            t.style.top = '12px';
            t.style.transform = 'translateX(-50%)';
            t.style.background = 'rgba(0,0,0,0.6)';
            t.style.padding = '8px 12px';
            t.style.borderRadius = '8px';
            t.style.zIndex = '9999';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.display = 'block';
        setTimeout(() => t && (t.style.display = 'none'), 2200);
    }
}