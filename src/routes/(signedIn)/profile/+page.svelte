<script lang="ts">
  import ChangeEmailForm from '$lib/components/forms/ChangeEmailForm.svelte'
  import ChangePasswordForm from '$lib/components/forms/ChangePasswordForm.svelte'
  import DeleteAccountForm from '$lib/components/forms/DeleteAccountForm.svelte'
  import { fade } from 'svelte/transition'
  import { alert } from '$lib/stores'
  import ChangeNameForm from '$lib/components/forms/ChangeNameForm.svelte'
  import Card from '$lib/components/Card.svelte'
  import type { PageData } from './$types'
  import { user } from '$lib/client/firebase'
  import PageLayout from '$lib/components/PageLayout.svelte'
  import Field from '$lib/components/Field.svelte'
  import Dialog from '$lib/components/Dialog.svelte'
  import Button from '$lib/components/Button.svelte'
  import DialogActions from '$lib/components/DialogActions.svelte'
  import QRious from 'qrious'
  import { onMount } from 'svelte'
  import Link from '$lib/components/Link.svelte'

  export let data: PageData

  let dialogEl: Dialog
  let disabled = false

  onMount(() => {
    return user.subscribe((user) => {
      new QRious({
        element: document.getElementById('qr'),
        value: `https://admin.hackharvard.io/user/${
          $user ? $user.profile.hhid : ''
        }`,
        size: 200,
      })
    })
  })

  async function handleVerificationEmail() {
    if ($user) {
      disabled = true
      fetch('/api/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'verifyEmail',
        }),
      }).then(async (res) => {
        if (res.ok) {
          alert.trigger('info', 'Verification email was sent.')
        } else {
          const { message } = await res.json()
          console.log(message)
          alert.trigger('error', message)
        }
        disabled = false
      })
    }
  }
</script>

<svelte:head>
  <title>Profile</title>
</svelte:head>

<Dialog bind:this={dialogEl} initial={!data.user.emailVerified} size="min">
  <svelte:fragment slot="title">Please verify your email</svelte:fragment>
  <div slot="description" class="space-y-4">
    <p>
      Your email is not verified. Please check your inbox and spam folder for
      the verification email. If you want to use another email, please change
      your email through the profile. <b
        >You must verify your email before proceeding with your application.</b
      >
    </p>
    <DialogActions>
      <Button on:click={dialogEl.cancel}>Close</Button>
    </DialogActions>
  </div>
</Dialog>

<PageLayout>
  <svelte:fragment slot="title">Profile</svelte:fragment>
  <div class="grid w-full max-w-2xl gap-6">
    {#if !data.user.emailVerified}
      <div
        class="mt-2 flex w-full items-center gap-4 rounded-md bg-red-200 px-5 py-4 shadow"
        transition:fade
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6 shrink-0"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <div class="grow">
          Email is not verified. Try reloading or check your inbox to verify
          your account. Can't find the email? <button
            class="inline-block border-b border-black text-black transition-colors duration-300 hover:border-gray-600 hover:text-gray-600 disabled:border-gray-600 disabled:text-gray-600"
            type="button"
            on:click={handleVerificationEmail}
            {disabled}>Send it again.</button
          >
          <b
            >You must verify your email before proceeding with your application.</b
          >
        </div>
      </div>
    {/if}
    <Card class="space-y-3">
      <div class="relative">
        <Field class="pr-9">
          <div class="relative h-6 overflow-x-auto">
            <div class="absolute left-0 top-0 whitespace-nowrap">
              {`HHID: ${$user ? $user.profile.hhid : ''}`}
            </div>
          </div>
        </Field>
        <div class="absolute right-2 top-2.5">
          <button
            class="text-black transition-colors duration-300 hover:text-gray-700"
            type="button"
            on:click={() => {
              if ($user) {
                navigator.clipboard.writeText($user.profile.hhid)
              }
            }}
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="M5 22q-.825 0-1.413-.588T3 20V7q0-.425.288-.713T4 6q.425 0 .713.288T5 7v13h10q.425 0 .713.288T16 21q0 .425-.288.713T15 22H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Zm0-2h9V4H9v12Zm0 0V4v12Z"
              /></svg
            >
          </button>
        </div>
      </div>

      <div class="flex justify-center">
        <canvas id="qr"></canvas>
      </div>

      <div class="text-sm">
        Any problems with changing your profile? Contact us at <Link
          href="mailto:tech@hackharvard.io">tech@hackharvard.io</Link
        >.
      </div>
    </Card>
    <ChangeNameForm />
    <ChangeEmailForm />
    <ChangePasswordForm />
    <DeleteAccountForm />
  </div>
</PageLayout>
