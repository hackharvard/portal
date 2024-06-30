<script lang="ts">
  import Input from '$lib/components/Input.svelte'
  import { alert } from '$lib/stores'
  import { doc, updateDoc } from 'firebase/firestore'
  import { updateProfile } from 'firebase/auth'
  import Form from '$lib/components/Form.svelte'
  import { db, user } from '$lib/client/firebase'
  import { onMount } from 'svelte'
  import Button from '../Button.svelte'
  import { cn } from '$lib/utils'

  let className = ''
  export { className as class }

  let disabled = true
  let showValidation = false
  let values = {
    firstName: '',
    lastName: '',
  }
  onMount(() => {
    return user.subscribe((user) => {
      if (user) {
        values.firstName = user.profile.firstName
        values.lastName = user.profile.lastName
        disabled = false
      }
    })
  })
  function handleSubmit(e: CustomEvent<SubmitData>) {
    if ($user) {
      const frozenUser = $user
      if (e.detail.error === null) {
        showValidation = false
        disabled = true
        const firstName = values.firstName.trim()
        const lastName = values.lastName.trim()
        updateDoc(doc(db, '2024-users', frozenUser.object.uid), {
          firstName,
          lastName,
        })
          .then(() =>
            updateProfile(frozenUser.object, {
              displayName: `${firstName} ${lastName}`,
            }).then(() => {
              disabled = false
              alert.trigger('success', 'Name successfully updated.')
            }),
          )
          .catch((err) => {
            disabled = false
            alert.trigger('error', err.code, true)
          })
      } else {
        showValidation = true
        alert.trigger('error', e.detail.error)
      }
    }
  }
</script>

<Form
  class={cn(showValidation && 'show-validation', className)}
  on:submit={handleSubmit}
>
  <fieldset {disabled}>
    <span class="font-bold">Name</span>
    <div class="grid gap-2 sm:grid-cols-2">
      <Input
        type="text"
        bind:value={values.firstName}
        label="First name"
        floating
        required
      />
      <div class="flex gap-2">
        <Input
          type="text"
          bind:value={values.lastName}
          label="Last name"
          floating
          required
        />
        <Button
          class="mt-2 flex h-12 w-12 shrink-0 items-center justify-center p-0"
          color="blue"
          type="submit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6"
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            /><polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </Button>
      </div>
    </div>
  </fieldset>
</Form>
