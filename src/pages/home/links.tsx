export const links = [
  {
    link: "https://effect.website/",
    title: "Effect",
    description: "Async Typescript done right",
    icon: "https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7GIDZrRPG0aFSRBt96jvbqTdMfrc7ZenUPNlYh",
  },
  {
    link: "https://bun.sh/",
    title: "Bun",
    description: "The fast JavaScript runtime and toolkit",
    icon: "https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7G6HJMz8WpHvU7IaAB1FX2yTVrmWgQez9qtZbJ",
  },
  {
    link: "https://htmx.org/",
    title: "HTMX",
    description: "HTML with built-in superpowers",
    icon: "https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7G7qcRcRkLQE98ruMh3gmzUPwbqJZfdcW2eGC1",
  },
];

export function Links() {
  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      {links.map((link) => (
        <LinkCard {...link} />
      ))}
    </div>
  );
}

function LinkCard({
  link,
  title,
  description,
  icon,
}: {
  link: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      class="group bg-white/95 dark:bg-neutral-900/60 rounded-xl border border-amber-300 dark:border-amber-500 p-6 flex flex-col items-center shadow-md [box-shadow:inset_0_-22px_44px_rgba(251,191,36,0.12)] dark:[box-shadow:inset_0_-18px_36px_rgba(251,191,36,0.08)] hover:shadow-lg hover:[box-shadow:inset_0_-28px_56px_rgba(251,191,36,0.18)] transition-all hover:scale-[1.02] backdrop-blur-sm"
    >
      <img class="size-12 mb-3" src={icon} alt={title} />
      <h3 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      <p class="text-sm text-neutral-700 dark:text-neutral-300 text-center leading-relaxed">
        {description}
      </p>
    </a>
  );
}
