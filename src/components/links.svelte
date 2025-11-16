<script lang="ts">
  import { cn } from "@lib/utils";

  const links = [
    {
      link: "https://effect.website/",
      title: "Effect",
      description: "Async Typescript done right",
      icon: "https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7GMM4JYRVu2UH9qIRLaiKd48mQhA5GOCyXFlD6",
    },
    {
      link: "https://bun.sh/",
      title: "Bun",
      description: "The fast JavaScript runtime and toolkit",
      icon: "https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7G6HJMz8WpHvU7IaAB1FX2yTVrmWgQez9qtZbJ",
    },
    {
      link: "https://svelte.dev/",
      title: "Svelte",
      description: "Cybernetically enhanced web apps",
      icon: "https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7GGK6sU8ijCpYNPhWsLVBK54R230QkiZJHxFXm",
    },
  ];
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
  {#each links as link}
    <a
      href={link.link}
      target="_blank"
      rel="noopener noreferrer"
      class="group bg-white/95 dark:bg-neutral-900/60 rounded-xl border border-amber-300 dark:border-amber-400 p-6 flex flex-col items-center shadow-md [box-shadow:inset_0_-22px_44px_rgba(251,191,36,0.12)] dark:[box-shadow:inset_0_-18px_36px_rgba(251,191,36,0.08)] hover:shadow-lg hover:[box-shadow:inset_0_-28px_56px_rgba(251,191,36,0.18)] transition-all hover:scale-[1.02] backdrop-blur-sm"
    >
      <img
        class={cn("size-12 mb-3", link.title === "Effect" && "dark:invert")}
        src={link.icon}
        alt={link.title}
      />
      <h3
        class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
      >
        {link.title}
      </h3>
      <p
        class="text-sm text-neutral-700 dark:text-neutral-300 text-center leading-relaxed"
      >
        {link.description}
      </p>
    </a>
  {/each}
</div>
