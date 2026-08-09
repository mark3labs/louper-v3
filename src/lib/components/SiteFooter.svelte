<script lang="ts">
  import { learnArticles } from '$lib/content/learn'
  import { SITE_NAME } from '$lib/seo'

  /**
   * Site footer. Provides the persistent links to the About, Privacy, Terms and
   * Contact pages that ad networks and users both expect to find.
   */
  const year = new Date().getFullYear()
  const topGuides = learnArticles.slice(0, 4)
</script>

<footer class="mt-16 border-t bg-background">
  <div class="container py-10">
    <div class="grid gap-8 md:grid-cols-4">
      <div class="md:col-span-1">
        <div class="flex items-center gap-2">
          <img src="/img/louper-logo.png" alt="" class="h-8 w-8" />
          <span class="font-bold text-primary">{SITE_NAME}</span>
        </div>
        <p class="mt-3 text-sm leading-6 text-muted-foreground">
          A free, open source inspector for EIP-2535 Diamond smart contracts.
        </p>
      </div>

      <div>
        <h2 class="mb-3 text-sm font-semibold text-foreground">Guides</h2>
        <ul class="space-y-2 text-sm">
          {#each topGuides as g (g.slug)}
            <li>
              <a
                href={`/learn/${g.slug}`}
                class="text-muted-foreground transition-colors hover:text-primary"
              >
                {g.title}
              </a>
            </li>
          {/each}
          <li>
            <a href="/learn" class="font-medium text-primary hover:underline">All guides →</a>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="mb-3 text-sm font-semibold text-foreground">Project</h2>
        <ul class="space-y-2 text-sm">
          <li>
            <a href="/about" class="text-muted-foreground transition-colors hover:text-primary">
              About
            </a>
          </li>
          <li>
            <a href="/contact" class="text-muted-foreground transition-colors hover:text-primary">
              Contact
            </a>
          </li>
          <li>
            <a
              href="https://github.com/mark3labs/louper-v3"
              target="_blank"
              rel="noopener"
              class="text-muted-foreground transition-colors hover:text-primary"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://discord.com/channels/730508054143172710/951483625092816976"
              target="_blank"
              rel="noopener"
              class="text-muted-foreground transition-colors hover:text-primary"
            >
              Discord
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="mb-3 text-sm font-semibold text-foreground">Legal</h2>
        <ul class="space-y-2 text-sm">
          <li>
            <a href="/privacy" class="text-muted-foreground transition-colors hover:text-primary">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/terms" class="text-muted-foreground transition-colors hover:text-primary">
              Terms of Service
            </a>
          </li>
          <li>
            <a
              href="https://eips.ethereum.org/EIPS/eip-2535"
              target="_blank"
              rel="noopener"
              class="text-muted-foreground transition-colors hover:text-primary"
            >
              EIP-2535
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between"
    >
      <p>© {year} Mark3Labs. Louper is open source software.</p>
      <p>Louper is an inspection tool, not an audit. Always verify contract data independently.</p>
    </div>
  </div>
</footer>
