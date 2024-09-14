<script lang="ts">
  import { db, user } from '$lib/client/firebase'
  import { alert } from '$lib/stores'
  import Form from '$lib/components/Form.svelte'
  import Button from '../Button.svelte'
  import Select from '$lib/components/Select.svelte'
  import Input from '$lib/components/Input.svelte'
  import { cn } from '$lib/utils'
  import { doc, getDoc, setDoc } from 'firebase/firestore'
  import { onMount } from 'svelte'
  import Link from '$lib/components/Link.svelte'
  import { status } from 'nprogress'
  import { onAuthStateChanged } from 'firebase/auth'

  let disabled = false
  let showValidation = false
  let values = {
    confirmed: '',
    travelPlans: '',
    waiver: false,
    photoRelease: false,
    submitting: false,
  }
  let attending: boolean | null = null
  const confirmedOptions = [
    {
      name: 'Yes, I can attend all 3 days of HackHarvard.',
    },
    {
      name: 'No, unfortuantely I cannot.',
    },
  ]
  onMount(() => {
    return user.subscribe((user) => {
      if (user) {
        getDoc(doc(db, '2024-confirmations', user.object.uid)).then(
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data()
              values = data as {
                confirmed: string
                travelPlans: string
                waiver: boolean
                photoRelease: boolean
                submitting: boolean
              }
              attending = data.confirmed === confirmedOptions[0].name
              disabled = true
            }
          },
        )
      }
    })
  })

  function handleSubmit(e: CustomEvent<SubmitData>) {
    if (e.detail.error === null) {
      showValidation = false
      disabled = true
      if ($user && attending === null) {
        const frozenUser = $user
        setDoc(doc(db, '2024-confirmations', frozenUser.object.uid), values)
          .then(() => {
            attending = values.confirmed === confirmedOptions[0].name
          })
          .catch((err) => {
            disabled = false
            alert.trigger('error', err.code, true)
          })
      }
    } else {
      showValidation = true
      alert.trigger('error', e.detail.error)
    }
  }
</script>

<Form class={cn(showValidation && 'show-validation')} on:submit={handleSubmit}>
  <fieldset class="space-y-4" {disabled}>
    <h2 class="text-xl font-bold">
      {#if attending === null}
        You're In! Confirm Your Attendance! If you can no longer attend, please <b
          >do not fill out this form</b
        >.
      {:else}
        Confirmation Submitted! If you'd like to update your status, please
        email us at <Link href="mailto:tech@hackharvard.io"
          >tech@hackharvard.io</Link
        >.
      {/if}
    </h2>
    <p>
      Travel Reimbursement applications are now open <Link
        href="https://forms.gle/gdivtjDsmBKRFmcXA">here</Link
      >. It is due September 20th, 11:59 PM Eastern Time.
    </p>
    {#if attending === null}
      <p>Congratulations for being accepted into HackHarvard!</p>
      <p>
        Please only fill this form if you are <span class="font-bold"
          >completely certain</span
        >
        that you can attend all 3 days of HackHarvard, which is October 11 - 13,
        2024. If you have any questions or need a confirmation letter for visa or
        funding purposes, please contact us at
        <Link href="mailto:team@hackharvard.io">team@hackharvard.io</Link>.
      </p>
    {/if}
    <Select
      bind:value={values.confirmed}
      label="Can you confirm that you can attend all 3 days of HackHarvard?"
      options={confirmedOptions}
      required
    />
    <Select
      bind:value={values.travelPlans}
      label="Have you finalized travel plans?"
      options={[
        {
          name: 'Yes, I have finalized travel plans.',
        },
        {
          name: 'No, I do not have travel plans right now.',
        },
      ]}
      required
    />
    <p>
      Please read the <Link
        href="https://storage.googleapis.com/hackharvard-public/waiver.pdf"
        target="_blank"
        rel="noreferrer">waiver</Link
      >. Note that agreeing to the waiver is required to attend.
    </p>
    <Input
      type="checkbox"
      bind:value={values.waiver}
      label="Yes, I have read the waiver and agree to the conditions."
      required
    />
    <Input
      type="checkbox"
      bind:value={values.photoRelease}
      label="I grant permission for my photograph, video, or likeness to be captured at HackHarvard and used by HackHarvard for event-related promotional and marketing purposes, including online and offline materials. I understand that I won’t receive compensation for this use, and my participation is voluntary. I agree to these terms by checking this box."
      required
    />
    <Input
      type="checkbox"
      bind:value={values.submitting}
      label="I understand submitting confirms my decision to attend HackHarvard and that I can no longer make further changes."
      required
    />
    {#if attending === null}
      <div class="flex justify-end">
        <Button color="blue" type="submit">Submit</Button>
      </div>
    {/if}
  </fieldset>
</Form>
