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
export class LoveQuestion {
@ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('yesBtn', { static: true }) yesBtnRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('card', { static: true }) cardRef!: ElementRef<HTMLDivElement>;

  // ✨ Question List
  questions: string[] = [
    "Do you love me?",                     // FIRST QUESTION (must always be first)
    "Are you sure you don't love me?",
    "Really? Think again please 🥺",
    "Come on... I know you do 😌",
    "Are you 100% sure?? 😳",
    "Just say yes, sweetheart 💕"
  ];

  currentQuestionIndex = 0;

  private cleanupTimeouts: number[] = [];

  constructor(private renderer: Renderer2) {}

  ngOnDestroy(): void {
    this.cleanupTimeouts.forEach(t => clearTimeout(t));
  }

  // NO button clicked
  onNoClick(): void {
    // Shake the card
    const el = this.cardRef.nativeElement;
    this.renderer.addClass(el, 'shake');
    const id = window.setTimeout(() => this.renderer.removeClass(el, 'shake'), 600);
    this.cleanupTimeouts.push(id);

    // Move to next question
    this.nextQuestion();
  }

  // ✔ Move to next question (loops automatically)
  nextQuestion(): void {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.questions.length) {
      // loop back to question 1 (NOT the first one)
      this.currentQuestionIndex = 1;
    }
  }

  onYesClick(): void {
    // keep existing heart celebration
    this.emitHeartsFrom(this.yesBtnRef.nativeElement, 20);

    // add pop effect
    const btn = this.yesBtnRef.nativeElement;
    this.renderer.addClass(btn, 'pop');
    const id = window.setTimeout(() => this.renderer.removeClass(btn, 'pop'), 300);
    this.cleanupTimeouts.push(id);
  }
  private emitHeartsFrom(originEl: HTMLElement, count: number) {
  const container = this.containerRef.nativeElement;
  const rect = originEl.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // button center relative to container
  const startX = rect.left + rect.width / 2 - containerRect.left;
  const startY = rect.top + rect.height / 2 - containerRect.top;

  for (let i = 0; i < count; i++) {
    const heart = this.renderer.createElement('span');
    this.renderer.addClass(heart, 'floating-heart');

    const emojis = ['💖', '❤️', '💘', '💞', '💕'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    heart.textContent = emoji;

    // slight random offset so all hearts don't overlap
    const offsetX = (Math.random() - 0.5) * rect.width * 0.6;

    this.renderer.setStyle(heart, 'left', `${startX + offsetX}px`);
    this.renderer.setStyle(heart, 'top', `${startY}px`);

    const duration = 900 + Math.random() * 700; // 900–1600ms
    const delay = Math.random() * 120;          // slight stagger
    this.renderer.setStyle(heart, 'animationDuration', `${duration}ms`);
    this.renderer.setStyle(heart, 'animationDelay', `${delay}ms`);

    const size = 18 + Math.random() * 18; // 18–36px
    this.renderer.setStyle(heart, 'fontSize', `${size}px`);

    this.renderer.appendChild(container, heart);

    // cleanup after animation
    const removeAfter = duration + delay + 100;
    const timeoutId = window.setTimeout(() => {
      try { this.renderer.removeChild(container, heart); } catch {}
    }, removeAfter);

    this.cleanupTimeouts.push(timeoutId);
  }
}

}
