import {
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { NtfyService } from '../ntfy.service';

@Component({
  selector: 'app-love-question',
  imports: [],
  templateUrl: './love-question.html',
  styleUrl: './love-question.css',
})
export class LoveQuestion implements OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('yesBtn', { static: true }) yesBtnRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('card', { static: true }) cardRef!: ElementRef<HTMLDivElement>;
  @ViewChild('noBtn') noBtnRef?: ElementRef<HTMLButtonElement>;

  // ✨ Question List
  questions: string[] = [
    'Are you mad ?',
    'Are you sure you aren\'t mad ? 🥺',
    'Really? Think again, madiee...',
    'Come on... I know you do 😌',
    'Are you 100% sure?? 😳',
    'The universe is voting for YES ✨'
  ];

  currentQuestionIndex = 0;
  noAttempts = 0;
  noRunning = false;
  accepted = false;
  noLabel = 'No 😅';
  letterOpen = false;
  musicPlaying = false;

  private cleanupTimeouts: number[] = [];
  private readonly musicPlayer = new Audio('assets/what_else.mp3');

  constructor(private renderer: Renderer2, private ntfy: NtfyService) {
    this.musicPlayer.loop = true;
    this.musicPlayer.preload = 'auto';
  }

  ngOnDestroy(): void {
    this.cleanupTimeouts.forEach(t => clearTimeout(t));
    this.stopMusic();
  }

  // NO button clicked
  onNoClick(): void {
    this.noAttempts++;
    const el = this.cardRef.nativeElement;
    this.renderer.addClass(el, 'shake');
    const shakeTimeout = window.setTimeout(() => this.renderer.removeClass(el, 'shake'), 600);
    this.cleanupTimeouts.push(shakeTimeout);

    this.ntfy.send(`No button clicked — attempt ${this.noAttempts}`);

    if (this.noAttempts >= 3) {
      this.noRunning = true;
      this.noLabel = 'Catch me!';
      this.moveNoButton();
    } else {
      this.nextQuestion();
    }
  }

  onNoEscape(): void {
    if (this.noRunning) {
      this.moveNoButton();
    }
  }

  moveNoButton(): void {
    const card = this.cardRef.nativeElement;
    const button = this.noBtnRef?.nativeElement;
    if (!button) return;

    const cardRect = card.getBoundingClientRect();
    const maxX = Math.max(0, cardRect.width - button.offsetWidth - 24);
    const maxY = Math.max(0, cardRect.height - button.offsetHeight - 24);
    const x = 12 + Math.random() * maxX;
    const y = 12 + Math.random() * maxY;

    this.renderer.setStyle(button, 'left', `${x}px`);
    this.renderer.setStyle(button, 'top', `${y}px`);
  }

  // ✔ Move to next question (loops automatically)
  nextQuestion(): void {
    this.currentQuestionIndex =
      this.currentQuestionIndex >= this.questions.length - 1
        ? 1
        : this.currentQuestionIndex + 1;
  }

  async onYesClick(): Promise<void> {
    const btn = this.yesBtnRef?.nativeElement;

    if (btn) {
      this.emitHeartsFrom(btn, 28);
      this.renderer.addClass(btn, 'pop');
      const popTimeout = window.setTimeout(() => this.renderer.removeClass(btn, 'pop'), 300);
      this.cleanupTimeouts.push(popTimeout);
    }

    this.accepted = true;
    this.ntfy.send('YES button clicked! 💕');

    const mod = await import('canvas-confetti');
    const confetti = mod.default ?? mod;

    confetti({
      particleCount: 140,
      spread: 90,
      startVelocity: 45,
      colors: ['#ff4d91', '#ff91bd', '#ffd1e1', '#fff0f5', '#c95cff'],
      origin: { x: 0.5, y: 0.45 },
      ticks: 180
    });
  }

  openLetter(): void {
    this.ntfy.send('Secret love letter opened 💌');
    this.letterOpen = true;
  }

  async toggleMusic(): Promise<void> {
    if (this.musicPlaying) {
      this.ntfy.send('Music paused');
      this.stopMusic();
      return;
    }

    this.ntfy.send('Music play button clicked 🎵');
    this.musicPlaying = true;
    this.musicPlayer.play().catch(() => this.musicPlaying = false);
  }

  private stopMusic(): void {
    this.musicPlayer.pause();
    this.musicPlayer.currentTime = 0;
    this.musicPlaying = false;
  }

  private emitHeartsFrom(originEl: HTMLElement, count: number): void {
    const container = this.containerRef.nativeElement;
    const rect = originEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // button center relative to container
    const startX = rect.left + rect.width / 2 - containerRect.left;
    const startY = rect.top + rect.height / 2 - containerRect.top;

    for (let i = 0; i < count; i++) {
      const heart = this.renderer.createElement('span');
      this.renderer.addClass(heart, 'floating-heart');

      const emojis = ['💖', '❤️', '💘', '💞', '💕', '✨'];
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      // slight random offset so all hearts don't overlap
      const offsetX = (Math.random() - 0.5) * rect.width * 0.8;
      const duration = 900 + Math.random() * 900;
      const delay = Math.random() * 160;
      const size = 18 + Math.random() * 18;

      this.renderer.setStyle(heart, 'left', `${startX + offsetX}px`);
      this.renderer.setStyle(heart, 'top', `${startY}px`);
      this.renderer.setStyle(heart, 'animationDuration', `${duration}ms`);
      this.renderer.setStyle(heart, 'animationDelay', `${delay}ms`);
      this.renderer.setStyle(heart, 'fontSize', `${size}px`);
      this.renderer.appendChild(container, heart);

      // cleanup after animation
      const timeoutId = window.setTimeout(() => {
        try { this.renderer.removeChild(container, heart); } catch {}
      }, duration + delay + 100);

      this.cleanupTimeouts.push(timeoutId);
    }
  }
}
