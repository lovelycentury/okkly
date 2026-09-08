/**
 * Shared surface primitives: effect application and the frosted glass surface
 * the pages build their materials from.
 */

import { autoFrame } from "../core/layout";
import { fillToken, strokeToken } from "../core/nodes";
import { ThemeContext, effectStyle } from "../core/theme";

/** Apply an effect style by name (async in dynamic-page mode). */
export async function applyEffect(node: BlendMixin, name: string, t: ThemeContext): Promise<void> {
  await node.setEffectStyleIdAsync(effectStyle(t, name).id);
}

/**
 * A frosted glass surface: translucent fill + hairline border + background blur.
 * `material` selects the blur strength (header / menu / card).
 */
export async function glassSurface(
  t: ThemeContext,
  material: "glass/header" | "glass/menu" | "glass/card",
  radius: number,
  strong = false,
): Promise<FrameNode> {
  const f = autoFrame({ name: "Glass surface" });
  f.cornerRadius = radius;
  fillToken(t, f, strong ? "glass/fill-strong" : "glass/fill");
  strokeToken(t, f, "glass/border", 1);
  await applyEffect(f, material, t);
  return f;
}
