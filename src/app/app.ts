import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type MenuStep = 'players' | 'layout' | 'life';
type LayoutType = 'horizontal' | 'vertical' | 'cross';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="game-container" [ngClass]="['grid-' + players(), 'layout-' + layout(), players() === 1 ? 'p1-mode' : '']">
      
      <!-- Player Grid -->
      <section 
        *ngFor="let p of playerList(); let i = index" 
        class="player player-{{i}}"
        [class.defeated]="p.life() <= 0"
      >
        <div class="player-box" [style.transform]="getRotation(i)">
          <div *ngIf="p.life() <= 0" class="skull-bg">☠</div>

          <button class="hit-area minus" (click)="adjustLife(i, -1)">
            <span class="op-label">-</span>
          </button>
          
          <div class="life-display" [style.fontSize]="getFontSize(i)">
            {{ p.life() }}
          </div>

          <button class="hit-area plus" (click)="adjustLife(i, 1)">
            <span class="op-label">+</span>
          </button>
        </div>
      </section>

      <!-- Central Menu Button -->
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
              <button (click)="nextStep('life', undefined, 'horizontal')">HORIZONTAL</button>
              <button (click)="nextStep('life', undefined, 'vertical')">VERTICAL</button>
              <button *ngIf="tempPlayers() === 4" (click)="nextStep('life', undefined, 'cross')">CROSS</button>
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

    .player { background: #fff; color: #000; overflow: hidden; position: relative; }

    /* Grids */
    .grid-1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
    .grid-2 { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
    .grid-2 .player-0 { border-bottom: 2px solid #000; }
    .grid-3 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
    .grid-3 .player-0 { grid-row: 2; grid-column: span 2; border-top: 2px solid #000; }
    .grid-3 .player-1 { grid-row: 1; grid-column: 1; border-right: 2px solid #000; }
    .grid-3 .player-2 { grid-row: 1; grid-column: 2; }
    .grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
    .grid-4 .player-0, .grid-4 .player-1 { border-bottom: 2px solid #000; }
    .grid-4 .player-0, .grid-4 .player-2 { border-right: 2px solid #000; }
    .grid-5 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; }
    .grid-5 .player-0, .grid-5 .player-1 { border-bottom: 2px solid #000; }
    .grid-5 .player-2, .grid-5 .player-3 { border-bottom: 2px solid #000; }
    .grid-5 .player-0, .grid-5 .player-2 { border-right: 2px solid #000; }
    .grid-5 .player-4 { grid-column: span 2; }
    .grid-6 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; }
    .grid-6 .player-0, .grid-6 .player-1, .grid-6 .player-2, .grid-6 .player-3 { border-bottom: 2px solid #000; }
    .grid-6 .player-0, .grid-6 .player-2, .grid-6 .player-4 { border-right: 2px solid #000; }

    .layout-cross.grid-4 {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
    }
    .layout-cross .player-0 { grid-area: 1 / 1 / 2 / 3; border-bottom: 2px solid #000; } 
    .layout-cross .player-1 { grid-area: 2 / 1; border-right: 2px solid #000; border-bottom: 2px solid #000; }
    .layout-cross .player-2 { grid-area: 2 / 2; border-bottom: 2px solid #000; }
    .layout-cross .player-3 { grid-area: 3 / 1 / 4 / 3; }

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
      font-weight: bold; font-size: 0.7rem; box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    /* Move menu up in 1 player mode to avoid covering numbers */
    .p1-mode .central-menu-btn {
      top: 10%;
    }

    .overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,255,255,0.98); display: flex; align-items: center; justify-content: center; z-index: 200;
    }

    .menu-card { width: 90%; border: 4px solid #000; background: #fff; padding: 20px; text-align: center; }
    .selector-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
    .selector-grid button { height: 60px; font-size: 1rem; border: 2px solid #000; background: #fff; font-weight: bold; }

    .close-btn { width: 100%; height: 50px; background: #000; color: #fff; font-weight: bold; margin-top: 10px; border: none; }

    .central-menu-btn:active, .selector-grid button:active {
      background: #000; color: #fff;
    }
  `]
})
export class App {
  public players = signal(3);
  public layout = signal<LayoutType>('horizontal');
  public startLifeValue = signal(40);
  public showMenu = signal(false);
  public menuStep = signal<MenuStep>('players');

  public tempPlayers = signal(3);
  private tempLayout: LayoutType = 'horizontal';

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
    if (!this.showMenu()) {
      this.menuStep.set('players');
      this.tempPlayers.set(this.players());
    }
    this.showMenu.update(v => !v);
  }

  public nextStep(step: MenuStep, p?: number, l?: LayoutType): void {
    if (p !== undefined) this.tempPlayers.set(p);
    if (l !== undefined) this.tempLayout = l;
    
    const tp = this.tempPlayers();
    if (step === 'layout' && (tp <= 3 || tp >= 5)) {
      this.tempLayout = (tp === 2) ? 'vertical' : 'horizontal';
      this.menuStep.set('life');
      return;
    }
    this.menuStep.set(step);
  }

  public startGame(life: number): void {
    this.startLifeValue.set(life);
    this.players.set(this.tempPlayers());
    this.layout.set(this.tempLayout);
    this.showMenu.set(false);
  }

  public getRotation(index: number): string {
    const n = this.players();
    const l = this.layout();

    if (n === 5) {
      if (index === 4) return 'rotate(0deg)';
      return (index % 2 === 0) ? 'rotate(90deg)' : 'rotate(-90deg)';
    }

    if (l === 'cross' && n === 4) {
      if (index === 0) return 'rotate(180deg)';
      if (index === 1) return 'rotate(90deg)';
      if (index === 2) return 'rotate(-90deg)';
      return 'rotate(0deg)';
    }

    if (n === 3) {
      if (index === 0) return 'rotate(0deg)';
      if (index === 1) return 'rotate(90deg)';
      return 'rotate(-90deg)';
    }

    if (l === 'horizontal') {
      if (n === 1) return 'rotate(0deg)';
      return (index % 2 === 0) ? 'rotate(90deg)' : 'rotate(-90deg)';
    }

    if (l === 'vertical') {
      if (n === 2) return index === 0 ? 'rotate(180deg)' : 'rotate(0deg)';
      return index < 2 ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    return 'rotate(0deg)';
  }

  public getFontSize(index: number): string {
    const n = this.players();
    const l = this.layout();

    if (n === 3) return index === 0 ? '20vh' : '12vw';
    if (n === 5) return index === 4 ? '20vh' : '12vw';
    if (n === 6) return '10vw';

    if (l === 'cross' && n === 4) return '12vw';
    if (l === 'horizontal' && n === 4) return '12vw';
    if (n === 1) return '35vh';
    if (n === 2) return '22vh';
    if (n <= 4) return '14vh';
    return '10vh';
  }
}
