<script lang="ts">
  import { cn } from '$lib/utils'
  import { uniqueId, kebabCase } from 'lodash-es'
  import { onDestroy } from 'svelte'
  import { fade } from 'svelte/transition'

  let className = ''
  export { className as class }

  export let self = undefined
  export let id = uniqueId('textarea-')
  export let value: string
  export let label = ''
  export let name = kebabCase(label)
  export let required = false
  export let rows = 5
  const calcHeight = 1.5 + 1.5 * rows

  let timer: number | undefined
  let visible = false
  onDestroy(() => {
    clearTimeout(timer)
  })
  function handleInput(
    e: Event & { currentTarget: EventTarget & HTMLTextAreaElement },
  ) {
    clearTimeout(timer)
    if (!visible) {
      visible = true
    }
    value = (e.target as HTMLTextAreaElement).value
  }
  function handleKeyUp() {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      visible = false
    }, 750)
  }
</script>

<div class="relative mt-2">
  <label for={id}>
    <span>
      {label}<span class={cn('text-red-500', !required && 'hidden')}>*</span>
    </span>
  </label>
  <textarea
    class={cn(
      'mt-2 block h-min w-full appearance-none rounded-md border border-gray-400 p-3 transition-colors placeholder:text-gray-500 focus:border-gray-600 focus:outline-none disabled:bg-white disabled:text-gray-400 disabled:placeholder:text-gray-400',
      className,
    )}
    style={`min-height:${calcHeight}rem;height:${calcHeight}rem`}
    bind:this={self}
    on:input={handleInput}
    on:keyup={handleKeyUp}
    {id}
    {value}
    {name}
    {required}
    {...$$restProps}
  ></textarea>
  {#if $$restProps?.maxlength && visible}
    <div
      class="absolute bottom-3 right-3 rounded border border-gray-100 bg-gray-100 px-1 text-gray-500 shadow-sm"
      transition:fade
    >
      {value?.length || 0}/{$$restProps.maxlength}
    </div>
  {/if}
</div>
