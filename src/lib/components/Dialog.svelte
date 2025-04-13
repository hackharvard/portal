<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { browser } from '$app/environment'
  import { uniqueId } from 'lodash-es'
  import { dialog } from '$lib/stores'
  import { fade } from 'svelte/transition'
  import { clickOutside, cn, trapFocus } from '$lib/utils'

  type Size = 'min' | 'full'

  const dispatch = createEventDispatcher()
  export let size: Size = 'min'
  export let disabled = false
  let openState = false
  export { openState as initial }
  const id = uniqueId('dialog-')
  export let alert = false
  $: if (browser) {
    if (openState) {
      dialog.set(id)
      document.body.style.overflowY = 'hidden'
    } else {
      if ($dialog === id) {
        dialog.set(null)
        document.body.style.overflowY = 'auto'
      }
    }
  }
  export function open() {
    if (!disabled) {
      openState = true
      dispatch('open', true)
    }
  }
  export function close() {
    if (!disabled) {
      openState = false
      dispatch('close', true)
    }
  }
  export function cancel() {
    if (!disabled) {
      openState = false
      dispatch('cancel', true)
    }
  }
  function handleEscape(e: KeyboardEvent) {
    if (openState && !disabled) {
      if (e.code === 'Escape') {
        cancel()
      }
    }
  }
</script>

<svelte:body on:keydown|stopPropagation={handleEscape} />

{#if openState}
  <div
    class="fixed inset-0 z-50 h-screen w-screen bg-black opacity-40"
    transition:fade={{ duration: 200 }}
  ></div>
  <div
    class="fixed inset-0 z-50 h-screen w-screen overflow-y-auto"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="relative flex min-h-screen items-end justify-center px-d/2 py-d sm:items-center"
    >
      <div
        class={cn(
          'grid w-full gap-3 rounded-lg bg-white p-4 sm:gap-6 sm:p-8',
          size === 'full' && 'h-full',
          size === 'min' && 'max-w-2xl',
        )}
        role="dialog"
        use:trapFocus
        use:clickOutside
        on:outclick={() => {
          if (!alert) {
            cancel()
          }
        }}
      >
        <h1
          class="rounded-md bg-gray-200 px-4 py-3 text-xl font-bold uppercase"
        >
          <slot name="title" />
        </h1>
        <slot name="description" />
      </div>
    </div>
  </div>
{/if}
