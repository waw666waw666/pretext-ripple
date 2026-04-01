import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

export const EXCERPT = `I don't know what the heck is going on. I woke up and I'm in some kind of room. A hospital room, I think. There are two dead bodies in here with me. The room is white and clean and has a lot of equipment I don't recognize. I'm in a bed that seems to be mounted to the wall. Everything is bolted down really well. Like, really well. I have an IV in my arm and I ache all over. My head hurts. My everything hurts. There's a little robot arm near my bed with a mechanical claw on the end. It holds a cup of water. I'm extremely thirsty. I drink the water. The robot retracts. What is this place? I try to remember how I got here but I can't. I don't even know who I am. I don't know my name. I don't know my job. I don't know anything. The only thing I know is science. For some reason I know a lot of science. I lie in bed for a long time. The little robot arm comes back now and then with food. It's a paste that tastes like bread. My muscles are very weak. So weak I can barely move. Something is very wrong with me. But I'm alive. That's something. The two bodies in the room with me are not so lucky. They are very dead. They are strapped into beds just like mine. I wonder who they were. I wonder who I am.`;

export const FONT = "18px Georgia";
export const LINE_HEIGHT = 28;
export const PADDING = 24;

export interface CharEntry {
  char: string;
  x: number;
  y: number;
  lineIndex: number;
}

export function buildCharMap(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number
): CharEntry[] {
  const maxWidth = canvasWidth - PADDING * 2;
  ctx.font = FONT;

  const prepared = prepareWithSegments(EXCERPT, FONT);
  const { lines } = layoutWithLines(prepared, maxWidth, LINE_HEIGHT);

  const charMap: CharEntry[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineText = lines[lineIndex].text;
    let cursorX = 0;

    for (let i = 0; i < lineText.length; i++) {
      const char = lineText[i];
      const charWidth = ctx.measureText(char).width;

      charMap.push({
        char,
        x: PADDING + cursorX,
        y: PADDING + lineIndex * LINE_HEIGHT,
        lineIndex,
      });

      cursorX += charWidth;
    }
  }

  return charMap;
}
