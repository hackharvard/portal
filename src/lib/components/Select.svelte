<script context="module" lang="ts">
  type SelectData = {
    id: string
    setOpen: (newState: boolean) => void
  }
  // Store for keeping track of open select elements
  import { writable } from 'svelte/store'
  export const openSelects = writable<SelectData | null>(null)
</script>

<script lang="ts">
  import { clickOutside, cn } from '$lib/utils'
  import { uniqueId, debounce, kebabCase } from 'lodash-es'
  import { fade } from 'svelte/transition'

  let className = ''
  export { className as class }

  export let self: HTMLInputElement | undefined = undefined
  export let id = uniqueId('select-')
  export let value: string
  export let label = ''
  export let name = kebabCase(label)
  export let floating = false
  export let required = false
  export let placeholder: string | undefined = undefined
  type SelectOption = string
  type SelectOptionJson = {
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  let optionsJson: Array<SelectOptionJson> = []
  export { optionsJson as options }

  let open = false
  let selectedOptionIndex = 0
  let currentActive: SelectData | null

  // Subscribe to the store to track open selects
  const unsubscribe = openSelects.subscribe((value) => {
    currentActive = value;
  });

  // Clean up subscription on component destruction
  import { onDestroy } from 'svelte';
  onDestroy(unsubscribe);

  const options = optionsJson.map((item) => item.name)
  let filteredOptions: Array<SelectOption> = []
  const filterOptionsBy = debounce((givenValue) => {
    if (givenValue === '') {
      filteredOptions = options
    } else {
      const lowerCaseValue = givenValue.toLowerCase()
      filteredOptions = options.filter(
        (name) => name.toLowerCase().indexOf(lowerCaseValue) !== -1,
      )
    }
  }, 150)

  $: if (open) {
    // close any other open select element
    if (currentActive && currentActive.id !== id) {
      currentActive.setOpen(false)
    }
    // Update the store
    openSelects.set({
      id,
      setOpen: (value) => {
        open = value
      },
    })
  } else {
    // validate value before close
    if (!options.includes(value)) {
      value = ''
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $: ((_) => {
    // validate updated value
    filterOptionsBy(value)
    if (self) {
      if (value === '' && required) {
        self.setCustomValidity('Please fill required fields.')
      } else {
        if (options.includes(value)) {
          self.setCustomValidity('')
        } else {
          self.setCustomValidity('Please select valid options.')
        }
      }
    }
  })(value)

  filterOptionsBy(value)

  function handleInput(
    e: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) {
    if (!open) {
      open = true
    }
    selectedOptionIndex = 0
    value = (e.target as HTMLInputElement).value
  }
  function handleKeyDown(e: KeyboardEvent) {
    switch (e.code) {
      case 'Escape':
        open = false
        break
      case 'Enter':
        e.preventDefault()
        open = false
        value = filteredOptions[selectedOptionIndex]
        break
      case 'Tab':
        if (open) {
          e.preventDefault()
          open = false
          value = filteredOptions[selectedOptionIndex]
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (selectedOptionIndex !== 0) {
          --selectedOptionIndex
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (selectedOptionIndex !== filteredOptions.length - 1) {
          ++selectedOptionIndex
        }
        break
    }
  }
  function handleFocusIn() {
    selectedOptionIndex = 0
    if (value === '') {
      filteredOptions = options
    } else {
      filteredOptions = [value, ...options.filter((name) => name !== value)]
    }
    open = true
  }
</script>

<div
  class={cn('relative mt-2', className)}
  use:clickOutside
  on:outclick={() => {
    open = false
  }}
>
  {#if floating}
    <div class="relative">
      <input
        class={cn(
          'peer block h-12 w-full appearance-none rounded-md border border-gray-400 pl-3 pr-9 pt-1 transition-colors focus:border-gray-600 focus:outline-none disabled:bg-white disabled:text-gray-400',
          className,
        )}
        type="text"
        placeholder=" "
        data-1p-ignore
        bind:this={self}
        on:input={handleInput}
        on:keydown={handleKeyDown}
        on:focusin={handleFocusIn}
        {value}
        {id}
        {name}
        {required}
        {...$$restProps}
      />
      <label
        class="absolute left-1 top-[0.65rem] z-10 origin-[0%_0%] -translate-y-4 transform cursor-text bg-white px-2 text-[0.8rem] leading-none text-gray-500 duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-focus:left-1 peer-focus:top-[0.65rem] peer-focus:-translate-y-4 peer-focus:text-[0.8rem] peer-focus:leading-none peer-disabled:text-gray-400"
        for={id}
      >
        <span>
          {label}<span class="text-red-500">*</span>
        </span>
      </label>
    </div>
    <div class="absolute right-0 top-0 flex h-12 items-center pr-2">
      <button
        type="button"
        aria-label="Toggle dropdown menu"
        on:click={() => {
          open = !open
          if (open && self) {
            self.focus()
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
          />
        </svg>
      </button>
    </div>
    {#if open}
      <div
        class="absolute left-0 top-14 z-20 max-h-60 w-full overflow-hidden overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-sm"
        transition:fade={{ duration: 100 }}
      >
        {#if filteredOptions.length === 0}
          <div class="w-full px-6 py-2 text-left">Nothing found.</div>
        {:else if filteredOptions.length === 1}
          <button
            class="w-full bg-gray-100 px-6 py-2 text-left transition-colors duration-300"
            type="button"
            on:click={() => {
              value = filteredOptions[0]
              open = false
            }}
          >
            {filteredOptions[0]}
          </button>
        {:else}
          {#each filteredOptions as name, index}
            <button
              class={cn(
                'w-full px-6 py-2 text-left transition-colors duration-300',
                index === selectedOptionIndex && 'bg-gray-100',
              )}
              type="button"
              on:click={() => {
                value = name
                open = false
              }}
              on:mouseenter={() => {
                selectedOptionIndex = index
              }}
            >
              {name}
            </button>
          {/each}
        {/if}
      </div>
    {/if}
  {:else}
    <label for={id}>
      <span>
        {label}<span class={cn('text-red-500', !required && 'hidden')}>*</span>
      </span>
    </label>
    <div class="relative">
      <div class="absolute right-0 top-0 flex h-12 items-center pr-2">
        <button
          type="button"
          aria-label="Toggle dropdown menu"
          on:click={() => {
            open = !open
            if (open && self) {
              self.focus()
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
            />
          </svg>
        </button>
      </div>
      <input
        class={cn(
          'mt-1 block h-12 w-full appearance-none rounded-md border border-gray-400 pl-3 pr-9 transition-colors placeholder:text-gray-500 focus:border-gray-600 focus:outline-none disabled:bg-white disabled:text-gray-400 disabled:placeholder:text-gray-400',
          className,
        )}
        type="text"
        data-1p-ignore
        bind:this={self}
        on:input={handleInput}
        on:keydown={handleKeyDown}
        on:focusin={handleFocusIn}
        {value}
        {id}
        {name}
        {required}
        {placeholder}
        {...$$restProps}
      />
      {#if open}
        <div
          class="absolute left-0 top-14 z-20 max-h-60 w-full overflow-hidden overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-sm"
          transition:fade={{ duration: 100 }}
        >
          {#if filteredOptions.length === 0}
            <div class="w-full px-6 py-2 text-left">Nothing found.</div>
          {:else if filteredOptions.length === 1}
            <button
              class="w-full bg-gray-100 px-6 py-2 text-left transition-colors duration-300"
              type="button"
              on:click={() => {
                value = filteredOptions[0]
                open = false
              }}
            >
              {filteredOptions[0]}
            </button>
          {:else}
            {#each filteredOptions as name, index}
              <button
                class={cn(
                  'w-full px-6 py-2 text-left transition-colors duration-300',
                  index === selectedOptionIndex && 'bg-gray-100',
                )}
                type="button"
                on:click={() => {
                  value = name
                  open = false
                }}
                on:mouseenter={() => {
                  selectedOptionIndex = index
                }}
              >
                {name}
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  input:not(:required) + label > span > span {
    display: none;
  }
  input:required:disabled + label > span > span {
    color: #fca5a5;
  }
</style>
