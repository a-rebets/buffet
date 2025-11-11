export const colors = {
  accent: "#ffd569",
  primary: "#f5bb33",
  accentDark: "#482105",
  muted: "#a8a29e",
} as const;

export const c = (
  color: string,
  text: string,
  bold = false,
  background?: string,
) => {
  const fg = Bun.color(color, "ansi") ?? "";
  const rawBg = background ? Bun.color(background, "ansi") : null;
  const bg = rawBg ? rawBg.replace("[38", "[48") : "";
  return `${bold ? "\x1b[1m" : ""}${bg}${fg}${text}\x1b[0m`;
};
