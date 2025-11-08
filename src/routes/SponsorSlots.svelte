<script lang="ts">
  // Sponsor data structure for advertisement slots
  interface Sponsor {
    name: string
    description: string
    logo: string
    type: 'paid' | 'placeholder'
  }

  // Static sponsor data array - UPDATE THIS TO CHANGE SPONSOR CONTENT
  // To update a sponsor: replace name, description, and logo path
  // Logo images should be placed in /static/img/ directory
  // Example: logo: '/img/quicknode-logo.svg'
  const sponsors: Sponsor[] = [
    // {
    //   name: 'Sponsor Slot 1',
    //   description:
    //     'This is a placeholder for sponsor content. Update this entry with actual sponsor information including name, description, and logo path.',
    //   logo: '/img/sponsor-placeholder.png',
    // },
  ]

  // Fallback image path
  const FALLBACK_LOGO = '/img/sponsor-placeholder.png'

  // Placeholder sponsor configuration
  const PLACEHOLDER_SPONSOR: Sponsor = {
    name: 'Advertise on Louper',
    description: 'Reach thousands of smart contract developers daily',
    logo: '/img/sponsor-placeholder.png',
    type: 'placeholder',
  }

  // Minimum number of slots to display
  const MIN_SLOTS = 3

  // Fill sponsors array with placeholders if needed
  const displaySponsors = [
    ...sponsors,
    ...Array(Math.max(0, MIN_SLOTS - sponsors.length)).fill(PLACEHOLDER_SPONSOR),
  ]
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
  {#each displaySponsors as sponsor}
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
          {#if sponsor.type == 'placeholder'}
            <script async src="https://js.stripe.com/v3/buy-button.js">
            </script>
            <div class="mt-2">
              <stripe-buy-button
                buy-button-id="buy_btn_1SRAaDG0vlyQlqWoiaoUHrDW"
                publishable-key="pk_live_AMIJSGA30dKObtxiKL0sOJQg"
              >
              </stripe-buy-button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>
