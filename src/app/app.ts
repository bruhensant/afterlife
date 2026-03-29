import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type MenuStep = 'players' | 'layout' | 'life';
type LayoutType = 'standard' | 'opposed' | 'cross';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="game-container" [ngClass]="['grid-' + players(), 'layout-' + layout()]">
      
      <!-- Player Grid -->
      <section 
        *ngFor="let p of playerList(); let i = index" 
        class="player player-{{i}}"
        [class.defeated]="p.life() <= 0"
      >
        <div class="player-box" [style.transform]="getRotation(i)">
          <!-- Background Skull (Only if defeated) -->
          <div *ngIf="p.life() <= 0" class="skull-bg">☠</div>

          <!-- Clickable Area Minus -->
          <button class="hit-area minus" (click)="adjustLife(i, -1)">
            <span class="op-label">-</span>
          </button>
          
          <!-- Central Life Display -->
          <div class="life-display" [style.fontSize]="getFontSize(i)">
            {{ p.life() }}
          </div>

          <!-- Clickable Area Plus -->
          <button class="hit-area plus" (click)="adjustLife(i, 1)">
            <span class="op-label">+</span>
          </button>
        </div>
      </section>

      <!-- Central Floating Menu Button -->
      <button *ngIf="!showMenu()" class="central-menu-btn" (click)="toggleMenu()">MENU</button>

      <!-- Options Overlay -->
      <div *ngIf="showMenu()" class="overlay">
        <div class="menu-card">
          <ng-container *ngIf="menuStep() === 'players'">
            <h2>PLAYERS</h2>
            <div class="selector-grid">
              <button *ngFor="let n of [1,2,3,4,5,6]" (click)="nextStep('layout', n)">{{ n }}</button>
            </div>
          </ng-container>

          <ng-container *ngIf="menuStep() === 'layout'">
            <h2>LAYOUT</h2>
            <div class="selector-grid">
              <button (click)="nextStep('life', undefined, 'standard')">STANDARD</button>
              <button *ngIf="players() >= 2" (click)="nextStep('life', undefined, 'opposed')">OPPOSED</button>
              <button *ngIf="players() === 4" (click)="nextStep('life', undefined, 'cross')">CROSS</button>
            </div>
          </ng-container>

          <ng-container *ngIf="menuStep() === 'life'">
            <h2>STARTING LIFE</h2>
            <div class="selector-grid">
              <button *ngFor="let l of [20, 30, 40, 100]" (click)="startGame(l)">{{ l }}</button>
            </div>
          </ng-container>

          <div class="menu-footer">
            <button class="close-btn" (click)="toggleMenu()">CANCEL</button>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: block; width: 100vw; height: 100vh; overflow: hidden;
      background: #fff; font-family: sans-serif;
    }

    .game-container {
      display: grid; width: 100%; height: 100%;
      background: #fff; position: relative;
    }

    /* Standard Grids */
    .grid-1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
    .grid-2 { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
    .grid-2 .player-0 { border-bottom: 2px solid #000; }
    
    .grid-3 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
    .grid-3 .player-0 { grid-column: span 2; border-bottom: 2px solid #000; }
    .grid-3 .player-1 { border-right: 2px solid #000; }

    .grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
    .grid-4 .player-0, .grid-4 .player-1 { border-bottom: 2px solid #000; }
    .grid-4 .player-0, .grid-4 .player-2 { border-right: 2px solid #000; }

    .grid-5 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; }
    .grid-5 .player-0, .grid-5 .player-1 { border-bottom: 2px solid #000; }
    .grid-5 .player-2, .grid-5 .player-3 { border-bottom: 2px solid #000; }
    .grid-5 .player-0, .grid-5 .player-2 { border-right: 2px solid #000; }
    .grid-5 .player-4 { grid-column: span 2; }

    /* 6 Players Standard - Horizontal Orientation <-> */
    .grid-6 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; }
    .grid-6 .player-0, .grid-6 .player-1, .grid-6 .player-2, .grid-6 .player-3 { border-bottom: 2px solid #000; }
    .grid-6 .player-0, .grid-6 .player-2, .grid-6 .player-4 { border-right: 2px solid #000; }

    /* Layout: CROSS (4 Players) */
    .layout-cross.grid-4 {
      grid-template-columns: 1fr 80px 1fr;
      grid-template-rows: 1fr 1.2fr 1fr;
    }
    .layout-cross .player-0 { grid-area: 1 / 1 / 2 / 4; border-bottom: 2px solid #000; } 
    .layout-cross .player-3 { grid-area: 3 / 1 / 4 / 4; border-top: 2px solid #000; }
    .layout-cross .player-1 { grid-area: 2 / 1; border-right: 2px solid #000; }
    .layout-cross .player-2 { grid-area: 2 / 3; border-left: 2px solid #000; }

    .player { background: #fff; color: #000; overflow: hidden; position: relative; }
    .player-box { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; position: relative; }

    .defeated { background: #000 !important; color: #fff !important; }
    .defeated .hit-area { color: #fff !important; }
    .defeated .skull-bg { color: #444 !important; }

    .skull-bg {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-size: 30vh; color: #eee; z-index: 1; pointer-events: none; line-height: 1;
    }

    .hit-area {
      flex: 1; height: 100%; border: none; background: transparent;
      display: flex; align-items: center; justify-content: center;
      padding: 0; cursor: pointer; touch-action: manipulation; z-index: 10;
    }

    .op-label { font-size: 2rem; font-weight: bold; opacity: 0.15; pointer-events: none; }

    .life-display {
      flex: 0 0 auto; min-width: 40%; font-weight: 900;
      text-align: center; line-height: 1; z-index: 20; pointer-events: none;
    }

    .hit-area:active { background: rgba(0,0,0,0.1); }
    .defeated .hit-area:active { background: rgba(255,255,255,0.2); }

    .central-menu-btn {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      z-index: 100; background: #fff; border: 2px solid #000; width: 80px; height: 40px;
      font-weight: bold; font-size: 0.7rem; display: flex; align-items: center; justify-content: center;
    }

    .overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,255,255,0.98); display: flex; align-items: center; justify-content: center; z-index: 200;
    }

    .menu-card { width: 90%; border: 4px solid #000; background: #fff; padding: 20px; text-align: center; }
    .selector-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
    .selector-grid button { height: 60px; font-size: 1.2rem; border: 2px solid #000; background: #fff; font-weight: bold; }

    .close-btn { width: 100%; height: 50px; background: #000; color: #fff; font-weight: bold; margin-top: 10px; border: none; }

    .central-menu-btn:active, .selector-grid button:active {
      background: #000; color: #fff;
    }
  `]
})
export class App {
  public players = signal(3);
  public layout = signal<LayoutType>('standard');
  public startLifeValue = signal(40);
  public showMenu = signal(false);
  public menuStep = signal<MenuStep>('players');

  private tempPlayers = 3;
  private tempLayout: LayoutType = 'standard';

  public playerList = computed(() => {
    return Array.from({ length: this.players() }, () => ({
      life: signal(this.startLifeValue())
    }));
  });

  public adjustLife(index: number, amount: number): void {
    const p = this.playerList()[index];
    if (p) p.life.update((v: number) => v + amount);
  }

  public toggleMenu(): void {
    if (!this.showMenu()) this.menuStep.set('players');
    this.showMenu.update(v => !v);
  }

  public nextStep(step: MenuStep, p?: number, l?: LayoutType): void {
    if (p !== undefined) this.tempPlayers = p;
    if (l !== undefined) this.tempLayout = l;
    
    // Auto-skip layout selection for 1, 2, 3, 5 and 6 players
    if (step === 'layout' && (this.tempPlayers <= 3 || this.tempPlayers >= 5)) {
      if (this.tempPlayers === 1) this.tempLayout = 'standard';
      if (this.tempPlayers === 2) this.tempLayout = 'opposed';
      if (this.tempPlayers === 3) this.tempLayout = 'standard';
      if (this.tempPlayers >= 5) this.tempLayout = 'standard';
      this.menuStep.set('life');
      return;
    }
    this.menuStep.set(step);
  }

  public startGame(life: number): void {
    this.startLifeValue.set(life);
    this.players.set(this.tempPlayers);
    this.layout.set(this.tempLayout);
    this.showMenu.set(false);
  }

  public getRotation(index: number): string {
    const n = this.players();
    const l = this.layout();

    if (n === 3) {
      if (index === 0) return 'rotate(180deg)';
      if (index === 1) return 'rotate(90deg)';
      if (index === 2) return 'rotate(-90deg)';
    }

    if (l === 'cross' && n === 4) {
      if (index === 0) return 'rotate(180deg)';
      if (index === 1) return 'rotate(90deg)';
      if (index === 2) return 'rotate(-90deg)';
      return 'rotate(0deg)';
    }

    // Standard orientation for 4 and 6 players <->
    if (l === 'standard' && (n === 4 || n === 6)) {
      if (index % 2 === 0) return 'rotate(90deg)'; // Left side
      return 'rotate(-90deg)'; // Right side
    }

    // 5 Players: 2 on Left (90), 2 on Right (-90), 1 on Bottom (0)
    if (n === 5) {
      if (index === 0 || index === 2) return 'rotate(90deg)';
      if (index === 1 || index === 3) return 'rotate(-90deg)';
      if (index === 4) return 'rotate(0deg)';
    }

    if (n === 1) return 'rotate(0deg)';

    if (l === 'opposed') {
      if (n === 2) return index === 0 ? 'rotate(180deg)' : 'rotate(0deg)';
      if (n === 4) return index < 2 ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    if (l === 'standard') {
      if (n === 2) return index === 0 ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    return 'rotate(0deg)';
  }

  public getFontSize(index: number): string {
    const n = this.players();
    const l = this.layout();

    if (n === 3) return index === 0 ? '20vh' : '12vw';
    if (n === 5) return index === 4 ? '20vh' : '12vw';
    if (n === 6) return '10vw';

    if (l === 'cross' && n === 4) return (index === 1 || index === 2) ? '12vw' : '15vh';
    if (l === 'standard' && n === 4) return '12vw';
    if (n === 1) return '35vh';
    if (n === 2) return '22vh';
    if (n <= 4) return '14vh';
    return '10vh';
  }
}
