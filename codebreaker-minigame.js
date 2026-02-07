// Code Breaker Minigame - Logic puzzle alternative to hack sequence
// Crack the code by analyzing feedback from your guesses

class CodeBreakerMinigame {
  constructor(difficulty = 1) {
    this.difficulty = difficulty;
    this.codeLength = this.getCodeLength(difficulty);
    this.maxAttempts = this.getMaxAttempts(difficulty);
    this.secretCode = this.generateCode();
    this.attempts = [];
    this.currentGuess = [];
    this.isRunning = false;
    this.onComplete = null;
    this.onFail = null;
    this.startTime = null;
    this.hintUsed = false;
  }

  getCodeLength(difficulty) {
    if (difficulty <= 2) return 3;
    if (difficulty <= 5) return 4;
    if (difficulty <= 7) return 5;
    return 6;
  }

  getMaxAttempts(difficulty) {
    if (difficulty <= 2) return 6;
    if (difficulty <= 5) return 6;
    if (difficulty <= 7) return 5;
    return 4;
  }

  generateCode() {
    const code = [];
    for (let i = 0; i < this.codeLength; i++) {
      code.push(Math.floor(Math.random() * 10));
    }
    return code;
  }

  init(container) {
    this.isRunning = true;
    this.startTime = Date.now();
    this.render(container);
    
    // Play start sound
    if (window.audio) window.audio.playButtonClick();
  }

  render(container) {
    container.innerHTML = `
      <div class="codebreaker-container">
        <div class="codebreaker-header">
          <h2 class="codebreaker-title">CODE BREAKER v2.0</h2>
          <div class="codebreaker-info">
            <span class="codebreaker-attempts">Attempts: ${this.attempts.length}/${this.maxAttempts}</span>
            <span class="codebreaker-length">Code Length: ${this.codeLength}</span>
          </div>
        </div>

        <div class="codebreaker-history" id="cbHistory">
          ${this.renderHistory()}
        </div>

        <div class="codebreaker-input-section">
          <div class="codebreaker-instruction">Enter ${this.codeLength}-digit code:</div>
          <div class="codebreaker-current-guess" id="cbCurrentGuess">
            ${this.renderCurrentGuess()}
          </div>
          
          <div class="codebreaker-keypad">
            ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => 
              `<button class="cb-key" data-num="${num}">${num}</button>`
            ).join('')}
          </div>

          <div class="codebreaker-actions">
            <button class="cb-action-btn cb-clear" id="cbClear">CLEAR</button>
            <button class="cb-action-btn cb-hint" id="cbHint" ${this.hintUsed || this.attempts.length < 3 ? 'disabled' : ''}>
              HINT ${this.attempts.length < 3 ? '(3+ attempts)' : ''}
            </button>
            <button class="cb-action-btn cb-submit" id="cbSubmit" ${this.currentGuess.length !== this.codeLength ? 'disabled' : ''}>SUBMIT</button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners(container);
  }

  renderHistory() {
    if (this.attempts.length === 0) {
      return '<div class="cb-no-history">No attempts yet. Start guessing!</div>';
    }

    return this.attempts.map((attempt, index) => `
      <div class="cb-attempt">
        <div class="cb-attempt-number">#${index + 1}</div>
        <div class="cb-attempt-guess">
          ${attempt.guess.map(digit => `<span class="cb-digit">${digit}</span>`).join('')}
        </div>
        <div class="cb-attempt-feedback">
          ${this.renderFeedback(attempt.feedback)}
        </div>
      </div>
    `).join('');
  }

  renderCurrentGuess() {
    const slots = [];
    for (let i = 0; i < this.codeLength; i++) {
      const digit = this.currentGuess[i];
      slots.push(`<div class="cb-guess-slot ${digit !== undefined ? 'filled' : ''}">${digit !== undefined ? digit : '_'}</div>`);
    }
    return slots.join('');
  }

  renderFeedback(feedback) {
    const icons = {
      correct: '<span class="cb-feedback-icon correct">🟢</span>',
      wrongPosition: '<span class="cb-feedback-icon wrong-pos">🟡</span>',
      notInCode: '<span class="cb-feedback-icon not-in">⚫</span>'
    };

    return `
      ${icons.correct.repeat(feedback.correct)}
      ${icons.wrongPosition.repeat(feedback.wrongPosition)}
      ${icons.notInCode.repeat(feedback.notInCode)}
    `;
  }

  attachEventListeners(container) {
    // Number keys
    container.querySelectorAll('.cb-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num);
        this.addDigit(num);
        this.updateDisplay(container);
      });
    });

    // Clear button
    container.querySelector('#cbClear').addEventListener('click', () => {
      this.currentGuess = [];
      this.updateDisplay(container);
      if (window.audio) window.audio.playButtonClick();
    });

    // Hint button
    const hintBtn = container.querySelector('#cbHint');
    if (hintBtn && !hintBtn.disabled) {
      hintBtn.addEventListener('click', () => {
        this.useHint();
        this.updateDisplay(container);
        if (window.audio) window.audio.playCorrectInput();
      });
    }

    // Submit button
    const submitBtn = container.querySelector('#cbSubmit');
    if (submitBtn && !submitBtn.disabled) {
      submitBtn.addEventListener('click', () => {
        this.submitGuess();
        this.updateDisplay(container);
      });
    }

    // Keyboard support
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  handleKeyPress(e) {
    if (!this.isRunning) return;

    if (e.key >= '0' && e.key <= '9') {
      this.addDigit(parseInt(e.key));
      this.updateDisplay(document.getElementById('cbCurrentGuess').closest('.codebreaker-container').parentElement);
    } else if (e.key === 'Backspace') {
      this.currentGuess.pop();
      this.updateDisplay(document.getElementById('cbCurrentGuess').closest('.codebreaker-container').parentElement);
    } else if (e.key === 'Enter' && this.currentGuess.length === this.codeLength) {
      this.submitGuess();
      this.updateDisplay(document.getElementById('cbCurrentGuess').closest('.codebreaker-container').parentElement);
    }
  }

  addDigit(digit) {
    if (this.currentGuess.length < this.codeLength) {
      this.currentGuess.push(digit);
      if (window.audio) window.audio.playNodeClick();
    }
  }

  useHint() {
    if (this.hintUsed || this.attempts.length < 3) return;
    
    this.hintUsed = true;
    // Reveal one random digit
    const randomIndex = Math.floor(Math.random() * this.codeLength);
    this.currentGuess[randomIndex] = this.secretCode[randomIndex];
    
    // Show hint message
    const container = document.querySelector('.codebreaker-container');
    const hint = document.createElement('div');
    hint.className = 'cb-hint-message';
    hint.textContent = `Hint: Position ${randomIndex + 1} is ${this.secretCode[randomIndex]}`;
    container.appendChild(hint);
    setTimeout(() => hint.remove(), 3000);
  }

  submitGuess() {
    if (this.currentGuess.length !== this.codeLength) return;

    const feedback = this.checkGuess(this.currentGuess);
    this.attempts.push({
      guess: [...this.currentGuess],
      feedback: feedback
    });

    // Play feedback sound
    if (feedback.correct === this.codeLength) {
      if (window.audio) window.audio.playHackSuccess();
    } else {
      if (window.audio) window.audio.playSymbolAppear();
    }

    // Check win condition
    if (feedback.correct === this.codeLength) {
      this.win();
      return;
    }

    // Check lose condition
    if (this.attempts.length >= this.maxAttempts) {
      this.lose();
      return;
    }

    // Clear current guess for next attempt
    this.currentGuess = [];
  }

  checkGuess(guess) {
    const feedback = {
      correct: 0,
      wrongPosition: 0,
      notInCode: 0
    };

    const secretCopy = [...this.secretCode];
    const guessCopy = [...guess];

    // First pass: check correct positions
    for (let i = 0; i < this.codeLength; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        feedback.correct++;
        secretCopy[i] = null;
        guessCopy[i] = null;
      }
    }

    // Second pass: check wrong positions
    for (let i = 0; i < this.codeLength; i++) {
      if (guessCopy[i] !== null) {
        const index = secretCopy.indexOf(guessCopy[i]);
        if (index !== -1) {
          feedback.wrongPosition++;
          secretCopy[index] = null;
        } else {
          feedback.notInCode++;
        }
      }
    }

    return feedback;
  }

  updateDisplay(container) {
    const historyEl = container.querySelector('#cbHistory');
    const guessEl = container.querySelector('#cbCurrentGuess');
    const submitBtn = container.querySelector('#cbSubmit');
    const hintBtn = container.querySelector('#cbHint');
    const attemptsEl = container.querySelector('.codebreaker-attempts');

    if (historyEl) historyEl.innerHTML = this.renderHistory();
    if (guessEl) guessEl.innerHTML = this.renderCurrentGuess();
    if (submitBtn) submitBtn.disabled = this.currentGuess.length !== this.codeLength;
    if (hintBtn) hintBtn.disabled = this.hintUsed || this.attempts.length < 3;
    if (attemptsEl) attemptsEl.textContent = `Attempts: ${this.attempts.length}/${this.maxAttempts}`;
  }

  calculateScore() {
    const timeElapsed = (Date.now() - this.startTime) / 1000;
    const baseScore = 100;
    const attemptBonus = (this.maxAttempts + 1 - this.attempts.length) * 50;
    const timeBonus = Math.max(0, Math.floor(100 - timeElapsed * 2));
    const hintPenalty = this.hintUsed ? -50 : 0;
    const perfectBonus = this.attempts.length === 1 ? 500 : 0;

    return baseScore + attemptBonus + timeBonus + hintPenalty + perfectBonus;
  }

  win() {
    this.isRunning = false;
    const score = this.calculateScore();

    // Show win message
    const container = document.querySelector('.codebreaker-container');
    const winMsg = document.createElement('div');
    winMsg.className = 'cb-result-message cb-win';
    winMsg.innerHTML = `
      <div class="cb-result-title">CODE CRACKED!</div>
      <div class="cb-result-code">Code was: ${this.secretCode.join(' ')}</div>
      <div class="cb-result-stats">
        <div>Attempts: ${this.attempts.length}/${this.maxAttempts}</div>
        <div>Time: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s</div>
        <div>Score: ${score}</div>
      </div>
    `;
    container.appendChild(winMsg);

    setTimeout(() => {
      if (this.onComplete) {
        this.onComplete(score);
      }
      this.cleanup();
    }, 2000);
  }

  lose() {
    this.isRunning = false;

    // Show lose message
    const container = document.querySelector('.codebreaker-container');
    const loseMsg = document.createElement('div');
    loseMsg.className = 'cb-result-message cb-lose';
    loseMsg.innerHTML = `
      <div class="cb-result-title">ACCESS DENIED</div>
      <div class="cb-result-code">Code was: ${this.secretCode.join(' ')}</div>
      <div class="cb-result-stats">
        <div>Failed after ${this.attempts.length} attempts</div>
      </div>
    `;
    container.appendChild(loseMsg);

    setTimeout(() => {
      if (this.onFail) {
        this.onFail();
      }
      this.cleanup();
    }, 2000);
  }

  cleanup() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
}

// Export for use in game.js
window.CodeBreakerMinigame = CodeBreakerMinigame;
