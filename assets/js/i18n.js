class LanguageManager {
  constructor() {
    this.currentLang = this.getPreferredLanguage();
    this.translations = {};
    this.supportedLanguages = ['zh-CN', 'zh-TW', 'en'];
  }

  // 获取用户偏好的语言
  getPreferredLanguage() {
    try {
      // 定义支持的语言列表
      const supportedLanguages = ['zh-CN', 'zh-TW', 'en'];
      
      // 首先检查本地存储
      const storedLang = localStorage.getItem('preferredLang');
      if (storedLang && supportedLanguages.includes(storedLang)) {
        return storedLang;
      }
      
      // 其次检查浏览器语言
      const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (supportedLanguages.includes(browserLang)) {
        return browserLang;
      }
      
      // 检查是否以支持的语言开头（比如'en-US'匹配'en'）
      for (const lang of supportedLanguages) {
        if (browserLang.startsWith(lang.toLowerCase())) {
          return lang;
        }
      }
    } catch (e) {
      console.warn('Error getting preferred language:', e);
    }
    
    // 默认返回简体中文
    return 'zh-CN';
  }

  // 加载语言文件
  async loadLanguage(lang) {
    // 定义支持的语言列表
    const supportedLanguages = ['zh-CN', 'zh-TW', 'en'];
    
    if (!supportedLanguages.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }
    
    try {
      // 使用相对于网站根目录的路径
      let localePath = './locales/';
      // 如果当前在 pages 目录下，则需要向上一级目录
      if (window.location.pathname.includes('/pages/')) {
        localePath = '../locales/';
      }
      
      const response = await fetch(`${localePath}${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language file: ${lang}`);
      }
      this.translations = await response.json();
      this.currentLang = lang;
      this.applyTranslations();
      this.updateLanguageSelector();
    } catch (error) {
      console.error('Error loading language file:', error);
    }
  }

  // 应用翻译到页面
  applyTranslations() {
    // 处理带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getValue(key);
      if (translation) {
        // 对于输入框，设置placeholder而不是textContent
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = translation;
        } else {
          element.innerHTML = translation;
        }
      }
    });
  }

  // 根据键获取翻译值
  getValue(key) {
    return key.split('.').reduce((obj, k) => obj && obj[k], this.translations);
  }

  // 切换语言
  switchLanguage(lang) {
    const supportedLanguages = ['zh-CN', 'zh-TW', 'en'];
    if (supportedLanguages.includes(lang) && lang !== this.currentLang) {
      localStorage.setItem('preferredLang', lang);
      this.loadLanguage(lang);
    }
  }

  // 更新语言选择器的显示状态
  updateLanguageSelector() {
    const selectors = document.querySelectorAll('.lang-selector');
    selectors.forEach(selector => {
      selector.classList.remove('active');
      if (selector.dataset.lang === this.currentLang) {
        selector.classList.add('active');
      }
    });
  }

  // 初始化语言管理器
  async init() {
    await this.loadLanguage(this.currentLang);
  }
}

// 创建全局实例
const i18n = new LanguageManager();

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
  });
} else {
  // DOM已经加载完成
  i18n.init();
}

// 为了确保在异步加载的header中也能使用，我们提供一个全局函数
window.switchLanguage = function(lang) {
  i18n.switchLanguage(lang);
};