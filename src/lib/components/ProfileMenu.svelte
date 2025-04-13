<script lang="ts">
  import { fade } from 'svelte/transition'
  import { clickOutside, cn } from '$lib/utils'
  import { navigating } from '$app/stores'
  import { signOut } from 'firebase/auth'
  import { auth } from '$lib/client/firebase'
  import { goto } from '$app/navigation'
  import { circInOut } from 'svelte/easing'

  let className = ''
  export { className as class }

  let open = false
  $: if ($navigating) {
    open = false
  }
  function handleSignOut() {
    fetch('/api/auth', {
      method: 'DELETE',
    })
      .then(() => {
        signOut(auth)
        goto('/signin')
      })
      .catch((err) => console.log('Sign Out Error:', err))
  }
</script>

<div
  class={cn('relative md:flex md:items-center', className)}
  use:clickOutside
  on:outclick={() => {
    open = false
  }}
>
  <button
    class="hidden h-10 w-10 items-center justify-center rounded-full border-2 border-black transition-colors hover:bg-gray-200 sm:flex"
    type="button"
    aria-label="Open profile menu"
    on:click={() => {
      open = !open
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="h-6 w-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  </button>
  {#if open}
    <div
      class="absolute right-0 top-14 w-40 rounded-md border border-gray-200 bg-white shadow"
      transition:fade={{ duration: 300, easing: circInOut }}
    >
      <a
        class="block w-full px-5 py-[0.65rem] transition-colors duration-300 hover:bg-gray-100"
        href="/profile">Profile</a
      >
      <button
        class="w-full px-5 py-[0.65rem] text-left transition-colors duration-300 hover:bg-gray-100"
        type="button"
        on:click={handleSignOut}
      >
        Sign out
      </button>
    </div>
  {/if}
  <div class="grid grid-cols-2 gap-3 text-center sm:hidden">
    <a
      class="block w-full rounded-md border border-gray-200 px-6 py-2 shadow-sm transition-colors duration-300 hover:bg-gray-100"
      href="/profile">Profile</a
    >
    <button
      class="w-full rounded-md border border-gray-200 px-6 py-2 shadow-sm transition-colors duration-300 hover:bg-gray-100"
      type="button"
      on:click={handleSignOut}
    >
      Sign out
    </button>
  </div>
</div>
