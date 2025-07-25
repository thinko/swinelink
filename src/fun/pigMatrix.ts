#!/usr/bin/env node

/**
 * Pig Matrix Rain - The Swine-Powered Matrix Effect 🐷
 * 
 * Inspired by the classic Matrix digital rain, but with a delicious twist!
 * Watch as bacon and pig emojis cascade down your terminal in digital glory.
 * Now with full 256-color and RGB support for beautiful pig-themed palettes!
 * Plus proper emoji alignment with full-width characters!
 * High-density, high-speed Matrix intensity optimized for ultra-wide terminals!
 * 
 * This is a hidden easter egg - shh! 🤫
 * Inspired by: https://porkbun.com/buniverse.html
 * 
 * @author Alex Handy <swinelinkapp@gmail.com>
 * @copyright 2025 Alex Handy
 * @version 1.1.0
 * @license MIT
 */

// Use global process object directly - no import needed

// ANSI escape codes for terminal manipulation
const ANSI = {
  CLEAR_SCREEN: '\x1b[2J',
  HIDE_CURSOR: '\x1b[?25l',
  SHOW_CURSOR: '\x1b[?25h',
  RESET_CURSOR: '\x1b[H',
  RESET: '\x1b[0m',
  MOVE_TO: (x: number, y: number) => `\x1b[${y};${x}H`,
  // 256-color support
  COLOR_256: (color: number) => `\x1b[38;5;${color}m`,
  // RGB color support (24-bit)
  RGB: (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`,
};

// The sacred pig and bacon characters - from Porkbun's buniverse plus bacon!
const PIG_CHARS = ['🐷', '🐖', '🐽', '🐗', '🥓'];

// Full-width Katakana and Matrix characters for proper emoji alignment
const FULL_WIDTH_CHARS = [
  // Full-width Katakana (properly 2-char wide)
  'ハ', 'ミ', 'ヒ', 'ー', 'ウ', 'シ', 'ナ', 'モ', 'ニ', 'サ', 'ワ', 'ツ', 'オ', 'リ', 'ア', 'ホ',
  'テ', 'マ', 'ケ', 'メ', 'エ', 'カ', 'キ', 'ム', 'ユ', 'ラ', 'セ', 'ネ', 'ス', 'タ', 'ヌ', 'ヘ',
  // Full-width numbers
  '０', '１', '２', '３', '４', '５', '６', '７', '８', '９',
  // Full-width symbols
  '■', '□', '◆', '◇', '●', '○', '▲', '△', '▼', '▽', '★', '☆'
];

// Half-width characters for denser areas
const HALF_WIDTH_CHARS = [
  // Half-width Katakana
  'ﾊ', 'ﾐ', 'ﾋ', 'ｰ', 'ｳ', 'ｼ', 'ﾅ', 'ﾓ', 'ﾆ', 'ｻ', 'ﾜ', 'ﾂ', 'ｵ', 'ﾘ', 'ｱ', 'ﾎ',
  'ﾃ', 'ﾏ', 'ｹ', 'ﾒ', 'ｴ', 'ｶ', 'ｷ', 'ﾑ', 'ﾕ', 'ﾗ', 'ｾ', 'ﾈ', 'ｽ', 'ﾀ', 'ﾇ', 'ﾍ',
  // Half-width numbers and symbols
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '|', ':', ';', '.'
];

// Rich color palettes for each emoji using RGB values
const EMOJI_COLOR_PALETTES = {
  '🐷': { // Pink pig - soft pinks and roses
    emoji: ANSI.RGB(255, 255, 255),      // Pure white for emoji
    bright: ANSI.RGB(255, 182, 193),     // Light pink
    high: ANSI.RGB(255, 105, 180),       // Hot pink
    medium: ANSI.RGB(219, 112, 147),     // Pale violet red
    low: ANSI.RGB(199, 21, 133),         // Medium violet red
    dim: ANSI.RGB(139, 69, 19),          // Saddle brown
    very_dim: ANSI.RGB(85, 107, 47)      // Dark olive green
  },
  '🐖': { // Regular pig - slightly different pink palette
    emoji: ANSI.RGB(255, 255, 255),      // Pure white for emoji
    bright: ANSI.RGB(255, 192, 203),     // Pink
    high: ANSI.RGB(255, 20, 147),        // Deep pink
    medium: ANSI.RGB(220, 20, 60),       // Crimson
    low: ANSI.RGB(178, 34, 34),          // Fire brick
    dim: ANSI.RGB(128, 0, 0),            // Maroon
    very_dim: ANSI.RGB(85, 107, 47)      // Dark olive green
  },
  '🐽': { // Pig nose - peachy pinks
    emoji: ANSI.RGB(255, 255, 255),      // Pure white for emoji
    bright: ANSI.RGB(255, 218, 185),     // Peach puff
    high: ANSI.RGB(255, 160, 122),       // Light salmon
    medium: ANSI.RGB(233, 150, 122),     // Dark salmon
    low: ANSI.RGB(205, 92, 92),          // Indian red
    dim: ANSI.RGB(160, 82, 45),          // Saddle brown
    very_dim: ANSI.RGB(85, 107, 47)      // Dark olive green
  },
  '🐗': { // Wild boar - earthy browns and oranges
    emoji: ANSI.RGB(255, 255, 255),      // Pure white for emoji
    bright: ANSI.RGB(255, 215, 0),       // Gold
    high: ANSI.RGB(255, 165, 0),         // Orange
    medium: ANSI.RGB(210, 180, 140),     // Tan
    low: ANSI.RGB(160, 82, 45),          // Saddle brown
    dim: ANSI.RGB(139, 69, 19),          // Saddle brown dark
    very_dim: ANSI.RGB(85, 107, 47)      // Dark olive green
  },
  '🥓': { // Bacon - delicious reds and yellows
    emoji: ANSI.RGB(255, 255, 255),      // Pure white for emoji
    bright: ANSI.RGB(255, 255, 0),       // Yellow
    high: ANSI.RGB(255, 215, 0),         // Gold
    medium: ANSI.RGB(255, 140, 0),       // Dark orange
    low: ANSI.RGB(255, 69, 0),           // Orange red
    dim: ANSI.RGB(220, 20, 60),          // Crimson
    very_dim: ANSI.RGB(85, 107, 47)      // Dark olive green
  }
};

// Classic Matrix green theme with rich greens
const CLASSIC_PALETTE = {
  emoji: ANSI.RGB(255, 255, 255),        // Pure white for emoji
  bright: ANSI.RGB(255, 255, 255),       // White
  high: ANSI.RGB(0, 255, 0),             // Bright green
  medium: ANSI.RGB(0, 200, 0),           // Medium green
  low: ANSI.RGB(0, 150, 0),              // Darker green
  dim: ANSI.RGB(0, 100, 0),              // Dark green
  very_dim: ANSI.RGB(0, 50, 0)           // Very dark green
};

// Fallback 256-color palettes for terminals that don't support RGB
const EMOJI_256_PALETTES = {
  '🐷': { // Pink pig
    emoji: ANSI.COLOR_256(15),           // White
    bright: ANSI.COLOR_256(217),         // Light pink
    high: ANSI.COLOR_256(213),           // Hot pink
    medium: ANSI.COLOR_256(205),         // Medium pink
    low: ANSI.COLOR_256(161),            // Dark pink
    dim: ANSI.COLOR_256(88),             // Dark red
    very_dim: ANSI.COLOR_256(22)         // Dark green
  },
  '🐖': { // Regular pig
    emoji: ANSI.COLOR_256(15),           // White
    bright: ANSI.COLOR_256(218),         // Pink
    high: ANSI.COLOR_256(198),           // Deep pink
    medium: ANSI.COLOR_256(160),         // Crimson
    low: ANSI.COLOR_256(124),            // Red
    dim: ANSI.COLOR_256(88),             // Maroon
    very_dim: ANSI.COLOR_256(22)         // Dark green
  },
  '🐽': { // Pig nose
    emoji: ANSI.COLOR_256(15),           // White
    bright: ANSI.COLOR_256(223),         // Peach
    high: ANSI.COLOR_256(216),           // Light salmon
    medium: ANSI.COLOR_256(209),         // Salmon
    low: ANSI.COLOR_256(167),            // Indian red
    dim: ANSI.COLOR_256(130),            // Brown
    very_dim: ANSI.COLOR_256(22)         // Dark green
  },
  '🐗': { // Wild boar
    emoji: ANSI.COLOR_256(15),           // White
    bright: ANSI.COLOR_256(220),         // Gold
    high: ANSI.COLOR_256(214),           // Orange
    medium: ANSI.COLOR_256(180),         // Tan
    low: ANSI.COLOR_256(130),            // Brown
    dim: ANSI.COLOR_256(94),             // Dark brown
    very_dim: ANSI.COLOR_256(22)         // Dark green
  },
  '🥓': { // Bacon
    emoji: ANSI.COLOR_256(15),           // White
    bright: ANSI.COLOR_256(226),         // Yellow
    high: ANSI.COLOR_256(220),           // Gold
    medium: ANSI.COLOR_256(208),         // Orange
    low: ANSI.COLOR_256(196),            // Red
    dim: ANSI.COLOR_256(160),            // Crimson
    very_dim: ANSI.COLOR_256(22)         // Dark green
  }
};

// Classic Matrix 256-color fallback
const CLASSIC_256_PALETTE = {
  emoji: ANSI.COLOR_256(15),             // White
  bright: ANSI.COLOR_256(15),            // White
  high: ANSI.COLOR_256(46),              // Bright green
  medium: ANSI.COLOR_256(40),            // Green
  low: ANSI.COLOR_256(34),               // Darker green
  dim: ANSI.COLOR_256(28),               // Dark green
  very_dim: ANSI.COLOR_256(22)           // Very dark green
};

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
  pigChar: string;
  trailChars: string[];
  age: number;
  useFullWidth: boolean;  // Whether this drop uses full-width or half-width chars
  speedCategory: 'slow' | 'medium' | 'fast' | 'blazing'; // Speed category for variations
}

interface GridCell {
  char: string;
  brightness: number;
  isPigEmoji: boolean;
  emojiType?: string;
  isFullWidth: boolean;   // Track character width for proper positioning
}

class PigMatrixRain {
  private columns: number;
  private rows: number;
  private drops: Drop[];
  private grid: GridCell[][];
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly maxDrops: number;
  private readonly trailLength: number = 20;
  private readonly classicMode: boolean;
  private readonly useRgb: boolean;

  constructor(classicMode: boolean = false) {
    // For emoji alignment, we need to account for their 2-char width
    this.columns = Math.floor((process.stdout.columns || 80) / 2) * 2; // Ensure even number
    this.rows = process.stdout.rows || 24;
    
    // Ultra-wide terminal optimized density calculation
    this.maxDrops = this.calculateOptimalDropCount();
    
    this.classicMode = classicMode;
    this.useRgb = this.detectRgbSupport();
    this.drops = [];
    this.grid = [];
    
    this.initializeGrid();
    this.initializeDrops();
    this.setupSignalHandlers();
  }

  private calculateOptimalDropCount(): number {
    const totalColumns = this.columns / 2; // Actual drop columns (accounting for 2-char width)
    
    // Adaptive density based on terminal width
    if (totalColumns <= 40) {
      // Small terminal: 90% density
      return Math.floor(totalColumns * 0.9);
    } else if (totalColumns <= 80) {
      // Medium terminal: 95% density  
      return Math.floor(totalColumns * 0.95);
    } else if (totalColumns <= 120) {
      // Large terminal: 100% density
      return Math.floor(totalColumns * 1.0);
    } else if (totalColumns <= 200) {
      // Very large terminal: 110% density (overlapping drops)
      return Math.floor(totalColumns * 1.1);
    } else {
      // Ultra-wide terminal (300+ chars): 120% density with aggressive overlap
      return Math.floor(totalColumns * 1.2);
    }
  }

  private detectRgbSupport(): boolean {
    // Check for RGB color support
    const colorterm = process.env.COLORTERM;
    const term = process.env.TERM;
    
    // Modern terminals that support RGB
    if (colorterm === 'truecolor' || colorterm === '24bit') {
      return true;
    }
    
    // Common terminals with RGB support
    if (term && (
      term.includes('256color') || 
      term.includes('xterm') || 
      term.includes('screen') ||
      term.includes('tmux')
    )) {
      return true;
    }
    
    // Default to 256-color mode for broader compatibility
    return false;
  }

  private initializeGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.columns; x++) {
        this.grid[y][x] = {
          char: ' ',
          brightness: 0,
          isPigEmoji: false,
          isFullWidth: false
        };
      }
    }
  }

  private initializeDrops(): void {
    this.drops = [];
    for (let i = 0; i < this.maxDrops; i++) {
      this.createDrop();
    }
  }

  private createDrop(): void {
    // Ensure drops start on even columns for emoji alignment
    const totalDropColumns = this.columns / 2;
    const baseX = Math.floor(Math.random() * totalDropColumns) * 2;
    const useFullWidth = Math.random() > 0.3; // 70% chance for full-width chars
    
    // Speed categories with much more variation
    const speedRoll = Math.random();
    let speedCategory: 'slow' | 'medium' | 'fast' | 'blazing';
    let speed: number;
    
    if (speedRoll < 0.15) {
      speedCategory = 'slow';
      speed = Math.random() * 0.3 + 0.1; // 0.1 - 0.4
    } else if (speedRoll < 0.35) {
      speedCategory = 'medium';
      speed = Math.random() * 0.4 + 0.4; // 0.4 - 0.8
    } else if (speedRoll < 0.75) {
      speedCategory = 'fast';
      speed = Math.random() * 0.6 + 0.8; // 0.8 - 1.4
    } else {
      speedCategory = 'blazing';
      speed = Math.random() * 0.8 + 1.4; // 1.4 - 2.2 (very fast!)
    }
    
    const drop: Drop = {
      x: baseX,
      y: -Math.floor(Math.random() * this.rows * 4), // Start even higher for staggered effect
      speed: speed,
      length: Math.floor(Math.random() * 15) + 5, // 5-20 characters (shorter trails for density)
      pigChar: this.getRandomPigChar(),
      trailChars: [],
      age: 0,
      useFullWidth: useFullWidth,
      speedCategory: speedCategory
    };
    
    // Pre-generate characters for this drop's trail
    const charSet = useFullWidth ? FULL_WIDTH_CHARS : HALF_WIDTH_CHARS;
    for (let i = 0; i < drop.length; i++) {
      drop.trailChars.push(charSet[Math.floor(Math.random() * charSet.length)]);
    }
    
    this.drops.push(drop);
  }

  private setupSignalHandlers(): void {
    // Handle terminal resize
    process.stdout.on('resize', () => {
      this.columns = Math.floor((process.stdout.columns || 80) / 2) * 2;
      this.rows = process.stdout.rows || 24;
      // Recalculate optimal drop count for new terminal size
      const newMaxDrops = this.calculateOptimalDropCount();
      
      this.initializeGrid();
      
      // Adjust drop count if needed
      if (newMaxDrops > this.maxDrops) {
        // Add more drops for larger terminal
        const dropsToAdd = newMaxDrops - this.drops.length;
        for (let i = 0; i < dropsToAdd; i++) {
          this.createDrop();
        }
      } else if (newMaxDrops < this.maxDrops) {
        // Remove excess drops for smaller terminal
        this.drops = this.drops.slice(0, newMaxDrops);
      }
      
      // Update maxDrops for future spawning
      (this as any).maxDrops = newMaxDrops;
    });

    // Handle graceful exit
    const exitHandler = () => {
      this.stop();
      process.exit(0);
    };

    process.on('SIGINT', exitHandler);
    process.on('SIGTERM', exitHandler);
  }

  private getRandomPigChar(): string {
    return PIG_CHARS[Math.floor(Math.random() * PIG_CHARS.length)];
  }

  private updateDrops(): void {
    // Clear the grid first
    this.initializeGrid();
    
    // Update each drop
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.y += drop.speed;
      drop.age++;
      
      // Draw the trail for this drop
      for (let j = 0; j < drop.length; j++) {
        const trailY = Math.floor(drop.y - j);
        const trailX = drop.x;
        
        if (trailY >= 0 && trailY < this.rows && trailX >= 0 && trailX < this.columns - 1) {
          // Calculate brightness based on position in trail (head is brightest)
          const brightness = Math.max(0, 1 - (j / drop.length));
          
          if (j === 0) {
            // Head of the trail - use pig emoji (always 2 chars wide)
            this.grid[trailY][trailX] = {
              char: drop.pigChar,
              brightness: 1.0,
              isPigEmoji: true,
              emojiType: drop.pigChar,
              isFullWidth: true
            };
            // Mark the second character position as occupied (but invisible)
            if (trailX + 1 < this.columns) {
              this.grid[trailY][trailX + 1] = {
                char: '',  // Empty but occupied
                brightness: 0,
                isPigEmoji: false,
                isFullWidth: false
              };
            }
          } else {
            // Trail - use appropriate character set
            if (drop.useFullWidth) {
              // Full-width trail character (2 chars wide)
              this.grid[trailY][trailX] = {
                char: drop.trailChars[j % drop.trailChars.length],
                brightness: brightness,
                isPigEmoji: false,
                emojiType: drop.pigChar,
                isFullWidth: true
              };
              // Mark the second character position as occupied
              if (trailX + 1 < this.columns) {
                this.grid[trailY][trailX + 1] = {
                  char: '',  // Empty but occupied
                  brightness: 0,
                  isPigEmoji: false,
                  isFullWidth: false
                };
              }
            } else {
              // Half-width trail characters for variety
              this.grid[trailY][trailX] = {
                char: drop.trailChars[j % drop.trailChars.length],
                brightness: brightness,
                isPigEmoji: false,
                emojiType: drop.pigChar,
                isFullWidth: false
              };
              // Also place a character in the second position for balance
              if (trailX + 1 < this.columns) {
                this.grid[trailY][trailX + 1] = {
                  char: drop.trailChars[(j + 1) % drop.trailChars.length],
                  brightness: brightness * 0.7, // Slightly dimmer
                  isPigEmoji: false,
                  emojiType: drop.pigChar,
                  isFullWidth: false
                };
              }
            }
          }
        }
      }
      
      // Remove drops that have moved completely off screen
      if (drop.y - drop.length > this.rows) {
        this.drops.splice(i, 1);
      }
    }
    
    // ULTRA-AGGRESSIVE drop spawning for ultra-wide terminal density
    while (this.drops.length < this.maxDrops) {
      // Very high chance to spawn new drops continuously - even higher for wide terminals
      const spawnChance = this.columns > 200 ? 0.9 : 0.8; // 90% for ultra-wide, 80% for others
      if (Math.random() < spawnChance) {
        this.createDrop();
      } else {
        break;
      }
    }
  }

  private getColorForBrightness(brightness: number, isPigEmoji: boolean, emojiType?: string): string {
    // Use classic green theme if --classic mode is enabled
    if (this.classicMode) {
      const palette = this.useRgb ? CLASSIC_PALETTE : CLASSIC_256_PALETTE;
      if (isPigEmoji) return palette.emoji;
      if (brightness > 0.8) return palette.bright;
      if (brightness > 0.6) return palette.high;
      if (brightness > 0.4) return palette.medium;
      if (brightness > 0.2) return palette.low;
      if (brightness > 0.1) return palette.dim;
      return palette.very_dim;
    }

    // Use emoji-specific color themes
    const rgbPalettes = EMOJI_COLOR_PALETTES;
    const fallbackPalettes = EMOJI_256_PALETTES;
    const palettes = this.useRgb ? rgbPalettes : fallbackPalettes;
    
    const palette = emojiType && palettes[emojiType] ? palettes[emojiType] : 
                   (this.useRgb ? CLASSIC_PALETTE : CLASSIC_256_PALETTE);
    
    if (isPigEmoji) {
      // Pig emojis get the brightest treatment
      return palette.emoji;
    } else {
      // Trail characters get proper color gradients based on emoji theme
      if (brightness > 0.8) return palette.bright;
      if (brightness > 0.6) return palette.high;
      if (brightness > 0.4) return palette.medium;
      if (brightness > 0.2) return palette.low;
      if (brightness > 0.1) return palette.dim;
      return palette.very_dim;
    }
  }

  private draw(): void {
    // Update drop positions and grid
    this.updateDrops();
    
    // Clear screen and reset cursor
    process.stdout.write(ANSI.CLEAR_SCREEN + ANSI.RESET_CURSOR);

    // Draw the entire grid with lower brightness threshold for denser effect
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        const cell = this.grid[y][x];
        
        if (cell.char !== ' ' && cell.char !== '' && cell.brightness > 0.02) { // Even lower threshold
          const color = this.getColorForBrightness(cell.brightness, cell.isPigEmoji, cell.emojiType);
          
          // Position calculation for proper alignment
          const screenX = x + 1;
          const screenY = y + 1;
          
          // Move cursor and draw character
          process.stdout.write(ANSI.MOVE_TO(screenX, screenY) + color + cell.char + ANSI.RESET);
        }
      }
    }
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    
    // Hide cursor and clear screen
    process.stdout.write(ANSI.HIDE_CURSOR + ANSI.CLEAR_SCREEN);
    
    // Show welcome message briefly
    const colorMode = this.useRgb ? "24-bit RGB" : "256-color";
    const themeMode = this.classicMode ? "Classic Matrix Mode" : "Pig-Themed Color Mode";
    const terminalInfo = `${Math.floor(this.columns/2)} cols × ${this.rows} rows (${this.maxDrops} drops)`;
    const welcomeMsg = `
    🐷 Welcome to the Pig Matrix! 🥓
    
    ${themeMode} (${colorMode})
    ${terminalInfo}
    "There is no spoon... only bacon!"
    "Follow the white pig..." 
    
    Press Ctrl+C to return to the farm (and exit the matrix...)
    `;
    
    console.log(ANSI.RGB(0, 255, 0) + welcomeMsg + ANSI.RESET);
    
    // Start the matrix after a brief pause
    setTimeout(() => {
      this.intervalId = setInterval(() => {
        this.draw();
      }, 50); // Much faster - 50ms for intense Matrix speed!
    }, 2500); // Shorter delay to get to the action faster
  }

  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clear screen and show cursor
    process.stdout.write(ANSI.CLEAR_SCREEN + ANSI.SHOW_CURSOR + ANSI.RESET_CURSOR);
    
    // Show exit message
    console.log(ANSI.RGB(255, 255, 255) + `
    🐷 Exiting the Pig Matrix... 🥓
    
    "That'll do, pig. That'll do."
    "You take the blue pill, you wake up in the barn..."
    
    Welcome back to reality!
    (Inspired by: https://porkbun.com/buniverse.html)
    ` + ANSI.RESET);
  }
}

// Export for use in CLI
export function startPigMatrix(classicMode: boolean = false): void {
  const matrix = new PigMatrixRain(classicMode);
  matrix.start();
}

// If run directly
if (require.main === module) {
  // Check for --classic argument
  const classicMode = process.argv.includes('--classic');
  startPigMatrix(classicMode);
} 