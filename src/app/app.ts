import { Component, Input, signal, SimpleChanges, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { map, Observable, startWith, Subscription, timer } from 'rxjs';
import { LoveQuestion } from "./love-question/love-question";
import { NtfyService } from './ntfy.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [LoveQuestion]
})
export class App {
  protected readonly title = signal('Petha');
  private readonly ntfy = inject(NtfyService);

  @Input() name = 'Petha';
  @Input() message = "You're my favourite hello.";

  // lazy-load canvas-confetti to avoid import/type issues & keep bundle small
  async playConfetti() {
    this.ntfy.send('Surprise/confetti button clicked 🎉');

    const mod = await import('canvas-confetti');
    const confetti = mod.default ?? mod; // support named/default
    const duration = 800;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 6 + Math.floor(Math.random() * 18),
        angle: 60 + Math.random() * 60,
        spread: 40 + Math.random() * 50,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: ['#ff6b9a','#ff9ecd','#ffc4d8','#ffdbe6']
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }


  @Input() meetDate: Date | string = new Date('2025-10-06');

  /** plain number used in template (no async pipe) */
  days: number = 0;

  private timerSub?: Subscription;

  ngOnInit(): void {
    // set up on init in case meetDate wasn't set through ngOnChanges
    this.setupDaysUpdater();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['meetDate']) {
      // recreate the timer when meetDate changes
      this.setupDaysUpdater();
    }
  }

  ngOnDestroy(): void {
    this.cleanupTimer();
  }

  private setupDaysUpdater(): void {
    this.cleanupTimer();

    const meet = this.toLocalDateStart(this.meetDate);

    // compute ms until next local midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const initialDelay = Math.max(0, nextMidnight.getTime() - now.getTime());

    const DAY_MS = 24 * 60 * 60 * 1000;

    // timer(initialDelay, DAY_MS) emits first after initialDelay then every DAY_MS
    // startWith(0) will make it emit immediately so UI updates right away
    this.timerSub = timer(initialDelay, DAY_MS)
      .pipe(
        startWith(0),
        map(() => this.computeDaysBetween(meet, new Date()))
      )
      .subscribe((d) => (this.days = d));
  }

  private cleanupTimer(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = undefined;
    }
  }

  private toLocalDateStart(d: Date | string): Date {
    const dt = d instanceof Date ? new Date(d.getTime()) : new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  private computeDaysBetween(startDate: Date, endDate: Date): number {
    const s = new Date(startDate.getTime());
    s.setHours(0, 0, 0, 0);
    const e = new Date(endDate.getTime());
    e.setHours(0, 0, 0, 0);

    const diffMs = e.getTime() - s.getTime();
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    return days >= 0 ? days : 0;
  }
  
}
