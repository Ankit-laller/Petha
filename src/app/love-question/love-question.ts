import {
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  OnDestroy
} from '@angular/core';

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
    'Do you love me?',
    'Are you sure you don’t love me? 🥺',
    'Really? Think again, cutie...',
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

  private musicContext?: AudioContext;
  private musicTimer?: number;
  private musicNodes: OscillatorNode[] = [];

  constructor(private renderer: Renderer2) {}

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
    this.accepted = true;
    this.emitHeartsFrom(this.yesBtnRef.nativeElement, 28);

    const btn = this.yesBtnRef.nativeElement;
    this.renderer.addClass(btn, 'pop');
    const popTimeout = window.setTimeout(() => this.renderer.removeClass(btn, 'pop'), 300);
    this.cleanupTimeouts.push(popTimeout);

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
    this.letterOpen = true;
  }

  async toggleMusic(): Promise<void> {
    if (this.musicPlaying) {
      this.stopMusic();
      return;
    }

    this.musicContext = new AudioContext();
    await this.musicContext.resume();
    this.musicPlaying = true;

    const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63];
    let noteIndex = 0;

    const playNote = () => {
      if (!this.musicContext || !this.musicPlaying) return;

      const oscillator = this.musicContext.createOscillator();
      const gain = this.musicContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = notes[noteIndex % notes.length];
      gain.gain.setValueAtTime(0.0001, this.musicContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, this.musicContext.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.musicContext.currentTime + 1.8);
      oscillator.connect(gain);
      gain.connect(this.musicContext.destination);
      oscillator.start();
      oscillator.stop(this.musicContext.currentTime + 1.9);
      this.musicNodes.push(oscillator);
      noteIndex++;
    };

    playNote();
    this.musicTimer = window.setInterval(playNote, 2300);
  }

  private stopMusic(): void {
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = undefined;
    }
    this.musicNodes.forEach(node => {
      try { node.stop(); } catch {}
    });
    this.musicNodes = [];
    if (this.musicContext) {
      void this.musicContext.close();
      this.musicContext = undefined;
    }
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
