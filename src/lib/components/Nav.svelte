<script>
  import ProfileMenu from './ProfileMenu.svelte'
  import { classNames } from '$lib/utils'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import Brand from './Brand.svelte'
  import { navigating } from '$app/stores'
  import { fade } from 'svelte/transition'
  import { user } from '$lib/firebase'
  import AnnouncementsBell from './AnnouncementsBell.svelte'

  onMount(() => {
    updateShadow()
  })

  let shadow = false
  let open = false
  $: pathname = $page.url.pathname
  $: if ($navigating) {
    open = false
  }
  $: emailVerified = $user?.emailVerified
  const pages = [
    {
      name: 'Dashboard',
      href: '/dashboard'
    },
    {
      name: 'Apply',
      href: '/apply'
    },
    {
      name: 'Group',
      href: '/group'
    },
    {
      name: 'Sleeping Bags',
      href: '/sleeping-bags'
    }
  ]
  function updateShadow() {
    shadow = window.scrollY !== 0
  }
</script>

<svelte:window on:scroll={updateShadow} />
<nav
  class={classNames(
    'px-dynamic fixed left-0 top-0 z-50 flex h-20 w-full items-center justify-between border-b bg-white transition-all',
    shadow && !open ? 'shadow-b border-gray-200' : 'border-white'
  )}
>
  <div class="flex items-center gap-8">
    <Brand />
    {#if emailVerified}
      <div class="hidden items-center gap-3 md:flex">
        {#each pages as page}
          <a
            class={classNames(
              'rounded-md px-3 py-2 transition-colors',
              pathname === page.href ? 'bg-gray-200' : 'hover:bg-gray-100'
            )}
            href={page.href}
          >
            {page.name}
          </a>
        {/each}
      </div>
    {/if}
  </div>
  <div class="flex items-center gap-2">
    {#if emailVerified}
      <AnnouncementsBell />
    {/if}
    <ProfileMenu class="hidden sm:block" />
    <button
      class="sm:hidden"
      type="button"
      on:click={() => {
        open = !open
      }}
    >
      {#if open}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-8 w-8"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-8 w-8"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      {/if}
    </button>
  </div>
</nav>
{#if open}
  <div
    class="p-dynamic fixed left-0 top-20 z-50 flex h-[calc(100vh-5rem)] w-screen flex-col gap-2 bg-white sm:hidden"
    transition:fade
  >
    {#each pages as page}
      <a
        class={classNames(
          'rounded-md px-3 py-2 transition-colors',
          pathname === page.href ? 'bg-gray-200' : 'hover:bg-gray-100'
        )}
        href={page.href}
      >
        {page.name}
      </a>
    {/each}
    <div class="mt-dynamic">
      <ProfileMenu />
    </div>
  </div>
{/if}
