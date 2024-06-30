<script lang="ts">
  import { alert } from '$lib/stores'
  import {
    EmailAuthProvider,
    deleteUser,
    reauthenticateWithCredential,
  } from 'firebase/auth'
  import Dialog from '$lib/components/Dialog.svelte'
  import Form from '$lib/components/Form.svelte'
  import Input from '$lib/components/Input.svelte'
  import { doc, deleteDoc } from 'firebase/firestore'
  import { ref, deleteObject } from 'firebase/storage'
  import { db, storage, user } from '$lib/client/firebase'
  import Button from '../Button.svelte'
  import DialogActions from '../DialogActions.svelte'
  import { cn } from '$lib/utils'

  let className = ''
  export { className as class }

  let dialogEl: Dialog
  let showValidation = false
  let disabled = false
  let values = {
    password: '',
  }

  function handleSubmit(e: CustomEvent<SubmitData>) {
    if (e.detail.error === null) {
      showValidation = false
      dialogEl.open()
    } else {
      showValidation = true
      alert.trigger('error', e.detail.error)
    }
  }
  function handleCancel() {
    alert.trigger('info', 'Account deletion canceled.')
  }
  async function handleReauthenticate(e: CustomEvent<SubmitData>) {
    if ($user) {
      const frozenUser = $user
      if (e.detail.error === null) {
        showValidation = false
        disabled = true
        reauthenticateWithCredential(
          frozenUser.object,
          EmailAuthProvider.credential(
            frozenUser.object.email as string,
            values.password,
          ),
        )
          .then(async () => {
            const hhid = frozenUser.profile.hhid
            const resumeRef = ref(
              storage,
              `resumes/${frozenUser.object.uid}.pdf`,
            )
            await Promise.all(
              [
                deleteObject(resumeRef),
                deleteDoc(doc(db, '2024-applications', frozenUser.object.uid)),
                deleteDoc(doc(db, '2024-decisions', frozenUser.object.uid)),
              ].map((p) => p.catch((e) => e)),
            )
            Promise.all([
              deleteDoc(doc(db, '2024-hhids', hhid)),
              deleteDoc(doc(db, '2024-users', frozenUser.object.uid)),
            ])
              .then(() => {
                deleteUser(frozenUser.object)
                  .then(() => {
                    alert.trigger(
                      'success',
                      'Account was successfully deleted.',
                    )
                    window.setTimeout(() => {
                      location.reload()
                    }, 2000)
                  })
                  .catch((err) => {
                    console.log(err)
                    disabled = false
                  })
              })
              .catch((err) => {
                console.log('HHID/User Object Deletion:', err)
                disabled = false
              })
          })
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
  <span class="font-bold">Delete account</span>
  <div class="mt-2">
    <Button color="red" type="submit">Delete account</Button>
  </div>
</Form>

<Dialog bind:this={dialogEl} on:cancel={handleCancel} {disabled} alert>
  <svelte:fragment slot="title">Delete account</svelte:fragment>
  <div slot="description" class="flex justify-center">
    <Form
      class={cn(showValidation && 'show-validation')}
      on:submit={handleReauthenticate}
    >
      <fieldset class="space-y-4" {disabled}>
        <div class="flex justify-center">
          <div class="w-full max-w-lg space-y-4">
            <Input
              type="password"
              bind:value={values.password}
              label="Password"
              floating
              required
              autocomplete="current-password"
              focus
            />
            <div class="font-bold">Warning! This is irreversible.</div>
          </div>
        </div>
        <DialogActions>
          <Button on:click={dialogEl.cancel}>Cancel</Button>
          <Button color="red" type="submit">Delete</Button>
        </DialogActions>
      </fieldset>
    </Form>
  </div>
</Dialog>
