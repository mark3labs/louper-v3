<script lang="ts">
  import { goto } from '$app/navigation'
  import Button from '$lib/components/ui/button/button.svelte'
  import { Search, ExternalLink } from '@lucide/svelte'
  import { featuredDiamonds } from '$lib/content/featured'
</script>

<h2 class="mb-2 text-2xl font-bold text-primary">Featured diamonds</h2>
<p class="mb-6 max-w-3xl text-muted-foreground">
  Production EIP-2535 deployments you can inspect right now. Each of these routes calls across
  dozens of facets from a single contract address.
</p>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {#each featuredDiamonds as d (d.url)}
    <div class="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <Button
          class="text-sm font-medium tracking-tight"
          variant="ghost"
          aria-label={`Inspect ${d.name} diamond`}
          title={`Inspect ${d.name}`}
          onclick={() => goto(d.url, { replaceState: true })}
        >
          <Search />
        </Button>
        <img src={d.icon} alt="" class="h-10 w-10 rounded-full" />
      </div>
      <div class="flex flex-1 flex-col p-6 pt-0">
        <div class="mb-2 text-2xl font-bold">{d.name}</div>
        <p class="flex-1 text-xs text-muted-foreground">{d.description}</p>
        <a
          href={d.projectUrl}
          target="_blank"
          rel="noopener"
          class="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Visit project <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </div>
  {/each}
</div>
