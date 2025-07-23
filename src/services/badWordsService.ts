import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BAD_WORDS_FILE = path.join(DATA_DIR, 'badWords.json');

export class BadWordsService {
  private badWords: string[] = [];

  constructor() {
    this.ensureDataDir();
    this.loadBadWords();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadBadWords(): void {
    try {
      if (fs.existsSync(BAD_WORDS_FILE)) {
        const data = fs.readFileSync(BAD_WORDS_FILE, 'utf8');
        this.badWords = JSON.parse(data);
        console.log(`📋 Loaded ${this.badWords.length} bad words`);
      } else {
        // Создаем файл по умолчанию
        this.badWords = [
          "спам", "реклама", "крипта", "казино", "xxx", "порно", 
          "18+", "секс", "заработок", "пирамида", "биткоин",
          "криптовалюта", "инвестиции", "форекс", "млм", "товар", "скидка"
        ];
        this.saveBadWords();
        console.log(`📋 Created default bad words file with ${this.badWords.length} words`);
      }
    } catch (error) {
      console.error('❌ Error loading bad words:', error);
      this.badWords = [];
    }
  }

  private saveBadWords(): void {
    try {
      fs.writeFileSync(BAD_WORDS_FILE, JSON.stringify(this.badWords, null, 2), 'utf8');
    } catch (error) {
      console.error('❌ Error saving bad words:', error);
    }
  }

  /**
   * Проверяет сообщение на наличие запрещенных слов
   */
  checkMessage(text: string): { found: boolean; word?: string } {
    const lowerText = text.toLowerCase();
    
    for (const badWord of this.badWords) {
      if (lowerText.includes(badWord.toLowerCase())) {
        return { found: true, word: badWord };
      }
    }
    
    return { found: false };
  }

  /**
   * Получить список всех запрещенных слов
   */
  getAllWords(): string[] {
    return [...this.badWords];
  }

  /**
   * Добавить новое запрещенное слово
   */
  addWord(word: string): boolean {
    const normalizedWord = word.toLowerCase().trim();
    
    if (!normalizedWord) {
      return false;
    }

    if (this.badWords.some(w => w.toLowerCase() === normalizedWord)) {
      return false; // Слово уже существует
    }

    this.badWords.push(normalizedWord);
    this.saveBadWords();
    console.log(`➕ Added bad word: "${normalizedWord}"`);
    return true;
  }

  /**
   * Удалить запрещенное слово
   */
  removeWord(word: string): boolean {
    const normalizedWord = word.toLowerCase().trim();
    const initialLength = this.badWords.length;
    
    this.badWords = this.badWords.filter(w => w.toLowerCase() !== normalizedWord);
    
    if (this.badWords.length < initialLength) {
      this.saveBadWords();
      console.log(`➖ Removed bad word: "${normalizedWord}"`);
      return true;
    }
    
    return false; // Слово не найдено
  }

  /**
   * Получить количество запрещенных слов
   */
  getCount(): number {
    return this.badWords.length;
  }

  /**
   * Перезагрузить список слов из файла
   */
  reload(): void {
    this.loadBadWords();
  }
}

export const badWordsService = new BadWordsService(); 