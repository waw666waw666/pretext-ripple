import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

const DEFAULT_TEXT = `The sun had set long ago, and the sky was now a deep shade of purple. Wang Miao stood at the window of his apartment, staring out at the city lights below. He couldn't shake the feeling that something was fundamentally wrong with the world. The countdown had appeared in his vision again, hovering at the edge of his consciousness like a persistent ghost. Four hundred and thirty hours, seventeen minutes, and thirty-three seconds remaining. He had tried to ignore it, to go about his daily life as a nanomaterials researcher, but the numbers followed him everywhere. His colleagues at the lab had noticed his distraction, his inability to focus on the superconducting materials project. Dr. Ding had asked if he was feeling ill, if he needed time off. But how could he explain that he was seeing a countdown that no one else could see? The game had started it all. Three Body, the mysterious virtual reality simulation that had consumed his evenings for weeks. He had put on the V-suit and entered that strange world with its three suns and chaotic climate. The civilizations that rose and fell, again and again, trying to predict the unpredictable motion of those burning stars. He had met people there, learned things that seemed impossible. Now the boundary between that virtual world and his reality was blurring. The countdown was proof of that. Someone was watching him, manipulating him, but he didn't know who or why. The police had shown up at his door yesterday, asking questions about a scientist who had committed suicide. Yang Dong, a brilliant physicist who had been working on the particle accelerator project. Her death didn't make sense, just like so many other recent suicides in the scientific community. Something was targeting them, hunting them down one by one. Wang checked his phone again, hoping for a message that would explain everything. Nothing. He thought about the strange woman he had met, the one who called herself the countdown terminator. She had shown him the universe flickering, the cosmic microwave background radiation dancing in patterns that shouldn't exist. Physics was broken, she had said. The fundamental laws that governed reality were being manipulated by forces beyond human comprehension. He wanted to dismiss it all as madness, but the evidence was undeniable. The stars themselves were sending messages, blinking in Morse code across the night sky. Someone was answering humanity's attempts to explore the universe, and their message was clear: stop, or face destruction. The countdown continued its relentless march toward zero, and Wang Miao had no idea what would happen when it reached its end.`;

const STORAGE_KEY = "pretext-ripple-custom-text";
const FONT_SIZE_KEY = "pretext-ripple-font-size";

// 性能限制参数
export const MAX_TEXT_LENGTH = 5000; // 最大文本长度（字符数）
export const MAX_CHARS_RENDER = 50000; // 最大渲染字符数（支持长文本重复填满屏幕）

// 字体大小配置
export const MIN_FONT_SIZE = 5;
export const MAX_FONT_SIZE = 20;
export const DEFAULT_FONT_SIZE = 7;

/**
 * 计算推荐的字体大小
 * 根据文本长度和屏幕尺寸计算最佳字体大小，确保文本完整显示
 */
export function calculateRecommendedFontSize(
  textLength: number,
  canvasWidth: number,
  canvasHeight: number
): number {
  // 估算每行可容纳的字符数（基于平均字符宽度）
  const avgCharWidth = 0.6; // 7px字体下平均字符宽度约为4.2px
  const padding = 80; // 左右边距总和
  const availableWidth = canvasWidth - padding;

  // 估算每行字符数和总行数
  const charsPerLine = Math.floor(availableWidth / (DEFAULT_FONT_SIZE * avgCharWidth));
  const totalLines = Math.ceil(textLength / charsPerLine);

  // 计算需要的行高来填满屏幕
  const targetLineHeight = canvasHeight / totalLines;

  // 根据行高反推字体大小（行高 = 字体大小 * 1.57）
  let recommendedSize = Math.floor(targetLineHeight / 1.57);

  // 限制在有效范围内
  recommendedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, recommendedSize));

  return recommendedSize;
}

/**
 * 获取字体大小建议
 * 根据当前文本和屏幕尺寸给出建议
 */
export function getFontSizeRecommendation(
  text: string,
  canvasWidth: number,
  canvasHeight: number
): { size: number; reason: string } {
  const textLength = text.length;
  const recommended = calculateRecommendedFontSize(textLength, canvasWidth, canvasHeight);

  let reason = "";
  if (recommended <= MIN_FONT_SIZE) {
    reason = "文本较长，已使用最小字体以确保完整显示";
  } else if (recommended >= MAX_FONT_SIZE) {
    reason = "文本较短，已使用最大字体以填满屏幕";
  } else {
    reason = `根据文本长度(${textLength}字符)和屏幕尺寸推荐`;
  }

  return { size: recommended, reason };
}

/** 获取当前字体大小 */
export function getFontSize(): number {
  if (typeof window === "undefined") return DEFAULT_FONT_SIZE;
  const saved = localStorage.getItem(FONT_SIZE_KEY);
  return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE;
}

/** 保存字体大小 */
export function saveFontSize(size: number): void {
  if (typeof window === "undefined") return;
  const clamped = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
  localStorage.setItem(FONT_SIZE_KEY, clamped.toString());
}

/** 生成字体样式字符串 */
export function getFontStyle(size?: number): string {
  const fontSize = size ?? getFontSize();
  return `${fontSize}px Georgia`;
}

/** 根据字体大小计算行高 */
export function getLineHeight(fontSize?: number): number {
  const size = fontSize ?? getFontSize();
  return Math.ceil(size * 1.57); // 7px字体对应11px行高，保持比例
}

/** 获取当前使用的文本内容 */
export function getCurrentText(): string {
  if (typeof window === "undefined") return DEFAULT_TEXT;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved || DEFAULT_TEXT;
}

/** 保存自定义文本 */
export function saveCustomText(text: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, text);
}

/** 重置为默认文本 */
export function resetToDefault(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** 检查是否使用了自定义文本 */
export function hasCustomText(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/** 截断文本至最大长度 */
export function truncateText(text: string, maxLength: number = MAX_TEXT_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/** 生成用于显示的文本（根据字体大小智能重复填满屏幕） */
export function generateExcerpt(text: string, canvasHeight: number = 1080, lineHeight?: number): string {
  const lh = lineHeight ?? getLineHeight();
  // 计算需要多少行才能填满屏幕（至少一屏）
  const targetLines = Math.max(1, Math.ceil(canvasHeight / lh));
  const avgCharsPerLine = 80; // 估算每行平均字符数
  const targetChars = targetLines * avgCharsPerLine;

  let result = text;
  // 智能重复：重复足够次数填满整个屏幕
  while (result.length < targetChars && result.length < MAX_CHARS_RENDER) {
    const newResult = result + " " + text;
    if (newResult.length > MAX_CHARS_RENDER) break;
    result = newResult;
  }

  return result;
}

/** 获取当前用于显示的文本 */
export function getExcerpt(): string {
  return generateExcerpt(getCurrentText());
}

// 动态获取字体和行高
export const FONT = getFontStyle();
export const LINE_HEIGHT = getLineHeight();
export const PADDING = 20; // 改为正值，确保文本在可视区域内

export interface CharEntry {
  char: string;
  x: number;
  y: number;
  lineIndex: number;
}

export function buildCharMap(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number = 1080,
  text?: string,
  fontSize?: number
): CharEntry[] {
  const maxWidth = canvasWidth - PADDING * 2;
  const fontStyle = getFontStyle(fontSize);
  const lineHeight = getLineHeight(fontSize);
  ctx.font = fontStyle;

  // 截断过长文本并生成智能重复
  const rawText = text || getCurrentText();
  const truncated = truncateText(rawText);
  const excerpt = generateExcerpt(truncated, canvasHeight, lineHeight);

  const prepared = prepareWithSegments(excerpt, fontStyle);
  const { lines } = layoutWithLines(prepared, maxWidth, lineHeight);

  const charMap: CharEntry[] = [];

  const isLastLine = (i: number) => i === lines.length - 1;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineText = lines[lineIndex].text;

    // Measure natural width of each character and total line width
    const charWidths: number[] = [];
    let naturalWidth = 0;
    for (let i = 0; i < lineText.length; i++) {
      const w = ctx.measureText(lineText[i]).width;
      charWidths.push(w);
      naturalWidth += w;
    }

    // Count spaces for justification (don't justify last line)
    let spaceCount = 0;
    if (!isLastLine(lineIndex)) {
      for (let i = 0; i < lineText.length; i++) {
        if (lineText[i] === " ") spaceCount++;
      }
    }

    const extraPerSpace =
      spaceCount > 0 ? (maxWidth - naturalWidth) / spaceCount : 0;

    let cursorX = 0;
    for (let i = 0; i < lineText.length; i++) {
      charMap.push({
        char: lineText[i],
        x: PADDING + cursorX,
        y: PADDING + lineIndex * lineHeight,
        lineIndex,
      });

      cursorX += charWidths[i];
      if (lineText[i] === " " && !isLastLine(lineIndex)) {
        cursorX += extraPerSpace;
      }
    }
  }

  return charMap;
}
