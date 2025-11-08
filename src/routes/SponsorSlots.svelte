<script lang="ts">
  // Sponsor data structure for advertisement slots
  interface Sponsor {
    name: string
    description: string
    logo: string
    tier: 'platinum' | 'gold' | 'silver'
  }

  // Static sponsor data array - UPDATE THIS TO CHANGE SPONSOR CONTENT
  // To update a sponsor: replace name, description, and logo path
  // Logo images should be placed in /static/img/ directory
  // Example: logo: '/img/quicknode-logo.svg'
  const sponsors: Sponsor[] = [
    {
      name: 'Sponsor Slot 1',
      description:
        'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
      logo: '/img/sponsor-placeholder.png',
      tier: 'platinum',
    },
    {
      name: 'Sponsor Slot 2',
      description:
        'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
      logo: '/img/sponsor-placeholder.png',
      tier: 'gold',
    },
    {
      name: 'Sponsor Slot 3',
      description:
        'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
      logo: '/img/sponsor-placeholder.png',
      tier: 'silver',
    },
  ]

  // Fallback image path
  const FALLBACK_LOGO = '/img/sponsor-placeholder.png'
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
  {#each sponsors as sponsor}
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-6 flex flex-row gap-4">
        <!-- Logo container with 1:1 aspect ratio -->
        <div class="flex-shrink-0 w-24 h-24">
          <div class="aspect-square overflow-hidden rounded-lg">
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              class="size-full object-cover object-center"
              loading="lazy"
              onerror={(e) => {
                const target = e.currentTarget as HTMLImageElement
                if (target.src !== FALLBACK_LOGO) {
                  console.error(`Failed to load logo for sponsor: ${sponsor.name}`)
                  target.src = FALLBACK_LOGO
                }
              }}
            />
          </div>
        </div>

        <!-- Text content -->
        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-bold mb-2">{sponsor.name}</h3>
          <p class="line-clamp-3 text-sm text-muted-foreground">
            {sponsor.description}
          </p>
        </div>
      </div>
    </div>
  {/each}
</div>
