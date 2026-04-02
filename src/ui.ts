import {
  saveCustomText,
  resetToDefault,
  getCurrentText,
  hasCustomText,
  MAX_TEXT_LENGTH,
  truncateText,
  getFontSize,
  saveFontSize,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  DEFAULT_FONT_SIZE,
  getFontSizeRecommendation,
} from "./text";

export interface UIOptions {
  onTextChange: (text: string) => void;
  onFontSizeChange?: (size: number) => void;
}

export function setupUI(options: UIOptions): void {
  // 创建悬浮按钮
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "text-toggle-btn";
  toggleBtn.innerHTML = "✎";
  toggleBtn.title = "自定义文本";
  applyToggleButtonStyles(toggleBtn);
  document.body.appendChild(toggleBtn);

  // 创建编辑面板
  const panel = createEditPanel(options);
  document.body.appendChild(panel);

  // 切换面板显示
  let isOpen = false;
  toggleBtn.addEventListener("click", () => {
    isOpen = !isOpen;
    panel.style.display = isOpen ? "flex" : "none";
    toggleBtn.style.opacity = isOpen ? "1" : "0.6";
  });

  // 点击面板外部关闭
  document.addEventListener("click", (e) => {
    if (isOpen && !panel.contains(e.target as Node) && e.target !== toggleBtn) {
      isOpen = false;
      panel.style.display = "none";
      toggleBtn.style.opacity = "0.6";
    }
  });
}

function createEditPanel(options: UIOptions): HTMLElement {
  const panel = document.createElement("div");
  panel.id = "text-edit-panel";
  applyPanelStyles(panel);

  // 标题
  const title = document.createElement("h3");
  title.textContent = "自定义文本";
  applyTitleStyles(title);
  panel.appendChild(title);

  // 文本输入框
  const textarea = document.createElement("textarea");
  textarea.id = "custom-text-input";
  textarea.placeholder = `在此输入自定义文本...`;
  textarea.value = getCurrentText();
  applyTextareaStyles(textarea);
  panel.appendChild(textarea);

  // 字符计数
  const counter = document.createElement("div");
  counter.id = "text-counter";
  counter.textContent = `${textarea.value.length} / ${MAX_TEXT_LENGTH} 字符`;
  applyCounterStyles(counter);
  panel.appendChild(counter);

  // 实时更新计数并限制长度
  textarea.addEventListener("input", () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / ${MAX_TEXT_LENGTH} 字符`;

    // 超过限制时截断
    if (len > MAX_TEXT_LENGTH) {
      textarea.value = textarea.value.substring(0, MAX_TEXT_LENGTH);
      counter.textContent = `${MAX_TEXT_LENGTH} / ${MAX_TEXT_LENGTH} 字符`;
      counter.style.color = "rgba(255, 100, 100, 0.8)";
      showToast(`文本已截断至 ${MAX_TEXT_LENGTH} 字符`);
    } else if (len > MAX_TEXT_LENGTH * 0.9) {
      counter.style.color = "rgba(255, 200, 100, 0.8)";
    } else {
      counter.style.color = "rgba(255, 255, 255, 0.4)";
    }
  });

  // 分隔线
  const divider = document.createElement("div");
  divider.style.cssText = `
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 8px 0;
  `;
  panel.appendChild(divider);

  // 字体大小控制区域
  const fontSizeSection = createFontSizeControl(options);
  panel.appendChild(fontSizeSection);

  // 按钮容器
  const btnContainer = document.createElement("div");
  applyBtnContainerStyles(btnContainer);

  // 应用按钮
  const applyBtn = document.createElement("button");
  applyBtn.textContent = "应用文本";
  applyPrimaryBtnStyles(applyBtn);
  applyBtn.addEventListener("click", () => {
    const text = textarea.value.trim();
    if (text) {
      saveCustomText(text);
      options.onTextChange(text);
      showToast("文本已更新！");
    }
  });
  btnContainer.appendChild(applyBtn);

  // 重置按钮
  const resetBtn = document.createElement("button");
  resetBtn.textContent = "恢复默认";
  applySecondaryBtnStyles(resetBtn);
  resetBtn.addEventListener("click", () => {
    resetToDefault();
    textarea.value = getCurrentText();
    counter.textContent = `${textarea.value.length} / ${MAX_TEXT_LENGTH} 字符`;
    options.onTextChange(getCurrentText());
    showToast("已恢复默认文本");
  });
  btnContainer.appendChild(resetBtn);

  panel.appendChild(btnContainer);

  // 提示文字
  const hint = document.createElement("div");
  hint.textContent = "提示：调整字体大小可让文本填满屏幕";
  applyHintStyles(hint);
  panel.appendChild(hint);

  return panel;
}

/** 创建字体大小控制组件 */
function createFontSizeControl(options: UIOptions): HTMLElement {
  const container = document.createElement("div");
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;

  // 标签行
  const labelRow = document.createElement("div");
  labelRow.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const label = document.createElement("span");
  label.textContent = "字体大小";
  label.style.cssText = `
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  const valueDisplay = document.createElement("span");
  const currentSize = getFontSize();
  valueDisplay.textContent = `${currentSize}px`;
  valueDisplay.style.cssText = `
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-width: 40px;
    text-align: right;
  `;

  labelRow.appendChild(label);
  labelRow.appendChild(valueDisplay);
  container.appendChild(labelRow);

  // 推荐提示
  const recommendationText = document.createElement("div");
  recommendationText.style.cssText = `
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 18px;
  `;
  container.appendChild(recommendationText);

  // 滑块
  const sliderContainer = document.createElement("div");
  sliderContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  const minLabel = document.createElement("span");
  minLabel.textContent = `${MIN_FONT_SIZE}px`;
  minLabel.style.cssText = `
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = MIN_FONT_SIZE.toString();
  slider.max = MAX_FONT_SIZE.toString();
  slider.value = currentSize.toString();
  slider.style.cssText = `
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  `;

  // 滑块样式
  const sliderStyle = document.createElement("style");
  sliderStyle.textContent = `
    #font-size-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(80, 120, 180, 0.9);
      cursor: pointer;
      transition: all 0.2s;
    }
    #font-size-slider::-webkit-slider-thumb:hover {
      background: rgba(100, 140, 200, 1);
      transform: scale(1.1);
    }
    #font-size-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(80, 120, 180, 0.9);
      cursor: pointer;
      border: none;
    }
  `;
  document.head.appendChild(sliderStyle);
  slider.id = "font-size-slider";

  const maxLabel = document.createElement("span");
  maxLabel.textContent = `${MAX_FONT_SIZE}px`;
  maxLabel.style.cssText = `
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  sliderContainer.appendChild(minLabel);
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(maxLabel);
  container.appendChild(sliderContainer);

  // 智能推荐按钮
  const autoSizeBtn = document.createElement("button");
  autoSizeBtn.textContent = "🎯 智能适配";
  autoSizeBtn.style.cssText = `
    padding: 8px 12px;
    border: 1px solid rgba(100, 150, 200, 0.4);
    border-radius: 6px;
    background: rgba(80, 120, 180, 0.15);
    color: rgba(150, 190, 240, 0.9);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin-top: 4px;
  `;

  autoSizeBtn.addEventListener("mouseenter", () => {
    autoSizeBtn.style.background = "rgba(80, 120, 180, 0.25)";
    autoSizeBtn.style.borderColor = "rgba(100, 150, 200, 0.6)";
  });
  autoSizeBtn.addEventListener("mouseleave", () => {
    autoSizeBtn.style.background = "rgba(80, 120, 180, 0.15)";
    autoSizeBtn.style.borderColor = "rgba(100, 150, 200, 0.4)";
  });

  container.appendChild(autoSizeBtn);

  // 更新推荐提示的函数 - 只显示建议，不改变字体
  const updateRecommendation = () => {
    const text = getCurrentText();
    const { size, reason } = getFontSizeRecommendation(
      text,
      window.innerWidth,
      window.innerHeight
    );
    recommendationText.textContent = `建议: ${size}px - ${reason}`;
    return size;
  };

  // 初始化推荐提示
  updateRecommendation();

  // 智能适配按钮点击事件 - 应用建议的字体大小
  autoSizeBtn.addEventListener("click", () => {
    const text = getCurrentText();
    const { size, reason } = getFontSizeRecommendation(
      text,
      window.innerWidth,
      window.innerHeight
    );

    // 更新滑块和显示
    slider.value = size.toString();
    valueDisplay.textContent = `${size}px`;

    // 保存并应用
    saveFontSize(size);
    if (options.onFontSizeChange) {
      options.onFontSizeChange(size);
    }

    showToast(`已应用建议字体: ${size}px`);
  });

  // 滑块事件
  let updateTimeout: number | null = null;
  slider.addEventListener("input", () => {
    const size = parseInt(slider.value, 10);
    valueDisplay.textContent = `${size}px`;

    // 防抖更新
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = window.setTimeout(() => {
      saveFontSize(size);
      if (options.onFontSizeChange) {
        options.onFontSizeChange(size);
      }
      updateTimeout = null;
    }, 150);
  });

  return container;
}

function showToast(message: string): void {
  const existing = document.getElementById("toast-message");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toast-message";
  toast.textContent = message;
  applyToastStyles(toast);
  document.body.appendChild(toast);

  // 动画显示
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  // 3秒后消失
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 样式函数
function applyToggleButtonStyles(btn: HTMLElement): void {
  btn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(20, 20, 20, 0.8);
    color: rgba(255, 255, 255, 0.8);
    font-size: 20px;
    cursor: pointer;
    z-index: 1000;
    opacity: 0.6;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  btn.addEventListener("mouseenter", () => {
    btn.style.opacity = "1";
    btn.style.background = "rgba(40, 40, 40, 0.9)";
  });
  btn.addEventListener("mouseleave", () => {
    if (!document.getElementById("text-edit-panel")?.style.display ||
        document.getElementById("text-edit-panel")?.style.display === "none") {
      btn.style.opacity = "0.6";
    }
    btn.style.background = "rgba(20, 20, 20, 0.8)";
  });
}

function applyPanelStyles(panel: HTMLElement): void {
  panel.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    width: 360px;
    max-width: calc(100vw - 40px);
    background: rgba(15, 15, 15, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    display: none;
    flex-direction: column;
    gap: 12px;
    z-index: 999;
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideIn 0.3s ease;
  `;

  // 添加动画样式
  if (!document.getElementById("panel-animations")) {
    const style = document.createElement("style");
    style.id = "panel-animations";
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

function applyTitleStyles(title: HTMLElement): void {
  title.style.cssText = `
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
}

function applyTextareaStyles(textarea: HTMLElement): void {
  textarea.style.cssText = `
    width: 100%;
    height: 200px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    outline: none;
    transition: border-color 0.2s;
  `;

  textarea.addEventListener("focus", () => {
    textarea.style.borderColor = "rgba(100, 150, 200, 0.5)";
  });
  textarea.addEventListener("blur", () => {
    textarea.style.borderColor = "rgba(255, 255, 255, 0.1)";
  });
}

function applyCounterStyles(counter: HTMLElement): void {
  counter.style.cssText = `
    text-align: right;
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
}

function applyBtnContainerStyles(container: HTMLElement): void {
  container.style.cssText = `
    display: flex;
    gap: 10px;
  `;
}

function applyPrimaryBtnStyles(btn: HTMLElement): void {
  btn.style.cssText = `
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    background: rgba(80, 120, 180, 0.8);
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  btn.addEventListener("mouseenter", () => {
    btn.style.background = "rgba(100, 140, 200, 0.9)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "rgba(80, 120, 180, 0.8)";
  });
}

function applySecondaryBtnStyles(btn: HTMLElement): void {
  btn.style.cssText = `
    flex: 1;
    padding: 10px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  btn.addEventListener("mouseenter", () => {
    btn.style.background = "rgba(255, 255, 255, 0.1)";
    btn.style.color = "rgba(255, 255, 255, 0.9)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "transparent";
    btn.style.color = "rgba(255, 255, 255, 0.7)";
  });
}

function applyHintStyles(hint: HTMLElement): void {
  hint.style.cssText = `
    color: rgba(255, 255, 255, 0.35);
    font-size: 12px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
}

function applyToastStyles(toast: HTMLElement): void {
  toast.style.cssText = `
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    padding: 12px 24px;
    background: rgba(40, 40, 40, 0.95);
    color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    font-size: 14px;
    z-index: 1001;
    opacity: 0;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
}
