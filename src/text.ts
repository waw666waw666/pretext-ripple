import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

const BASE_TEXT = `I don't know what the heck is going on. I woke up and I'm in some kind of room. A hospital room, I think. There are two dead bodies in here with me. The room is white and clean and has a lot of equipment I don't recognize. I'm in a bed that seems to be mounted to the wall. Everything is bolted down really well. Like, really well. I have an IV in my arm and I ache all over. My head hurts. My everything hurts. There's a little robot arm near my bed with a mechanical claw on the end. It holds a cup of water. I'm extremely thirsty. I drink the water. The robot retracts. What is this place? I try to remember how I got here but I can't. I don't even know who I am. I don't know my name. I don't know my job. I don't know anything. The only thing I know is science. For some reason I know a lot of science. I lie in bed for a long time. The little robot arm comes back now and then with food. It's a paste that tastes like bread. My muscles are very weak. So weak I can barely move. Something is very wrong with me. But I'm alive. That's something. The two bodies in the room with me are not so lucky. They are very dead. They are strapped into beds just like mine. I wonder who they were. I wonder who I am. I spend the next few days in a haze. I sleep. I wake. I eat the paste. I drink water from the robot. I try to move my arms and legs but they're like jelly. Gradually, I start to piece things together. My name is Ryland Grace. I'm a teacher. No, wait. I was a teacher. Junior high school science. I remember that much. I remember my classroom. I remember the kids. I remember loving my job. But how did I get here? And where is here? The room has no windows. There's a door, but it's sealed shut. The two dead people don't provide any useful information, on account of being dead. The little robot arm is my only companion. It's attached to a sophisticated mechanism on the wall. It brings me food and water at regular intervals. It also takes my blood pressure and temperature. Sometimes it gives me shots. I don't know what's in them but I feel a little better each day. My muscles are slowly coming back. I can sit up now. I can swing my legs over the side of the bed. Progress. I notice the room is very well designed. Everything is mounted to the walls or floor. There are no loose objects anywhere. The beds are solid and sturdy, bolted into the wall. The equipment around the room is similarly secured. It's like someone expected this room to be in unusual conditions. Zero gravity, maybe? That thought sticks with me. Why would a hospital room be designed for zero gravity? I look around more carefully now that I can sit up. The walls are covered in a soft material, almost like padding. There are small hatches and compartments everywhere, all sealed with latches that look like they could handle serious force. The lighting comes from panels in the ceiling that give off a warm, steady glow. No flickering, no buzzing. Very high quality. The air smells clean, almost sterile, but with a faint metallic undertone. The temperature is perfect. Not too warm, not too cold. Whoever built this place spent a lot of money on it. The equipment around me is advanced. Way more advanced than anything I've seen in a hospital. Some of it I can identify. Heart monitors, IV pumps, ventilators. But others are completely foreign to me. Sleek machines with smooth surfaces and no visible controls. They hum quietly. The two dead people bother me. Not in a scared way, but in a curious way. They're wearing the same kind of jumpsuit I am. Light gray, comfortable, with a small patch on the chest. I can't read the patch from my bed. They look peaceful. Like they just went to sleep and never woke up. I wonder what happened to them. I wonder if the same thing almost happened to me.`;
export const EXCERPT = BASE_TEXT + " " + BASE_TEXT + " " + BASE_TEXT;

export const FONT = "7px Georgia";
export const LINE_HEIGHT = 11;
export const PADDING = -40;

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
        y: PADDING + lineIndex * LINE_HEIGHT,
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
