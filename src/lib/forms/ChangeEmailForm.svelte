<script>
  import Input from '$lib/components/Input.svelte'
  import { classNames } from '$lib/utils'
  import { createFields, enableErrors, clearFields, isValid } from '$lib/forms'
  import { user } from '$lib/firebase'
  import { alert } from '$lib/stores'
  import { verifyBeforeUpdateEmail } from 'firebase/auth'
  import Modal from '$lib/components/Modal.svelte'
  import ReauthenticateForm from '$lib/forms/ReauthenticateForm.svelte'

  let modalEl
  let formEl
  let showValidation = false
  let fields = {
    default: createFields.text('newEmail')
  }
  function handleSubmit() {
    showValidation = true
    if (isValid(formEl)) {
      modalEl.setOpen(true)
    }
  }
  function handleReauthenticated(reauthenticated) {
    if (reauthenticated) {
      modalEl.setOpen(false)
      verifyBeforeUpdateEmail($user, fields.default.newEmail.value)
        .then(() => {
          showValidation = false
          fields = clearFields.allSections(fields)
          alert.trigger('info', 'A verification email was sent.')
        })
        .catch(err => {
          fields = enableErrors.allSections(fields)
          alert.trigger('error', err.code)
        })
    }
  }
</script>

<form
  class={classNames('max-w-lg w-full grid', showValidation && 'show-validation')}
  bind:this={formEl}
  on:submit|preventDefault={handleSubmit}
  novalidate
>
  <div class="grid gap-1">
    <span class="font-bold">Change email</span>
    <Input
      type="email"
      field={{
        value: $user ? $user.email : '',
        error: false
      }}
      placeholder="Current email"
      floating
      readonly
    />
    <div class="relative">
      <Input
        class="pr-[5.25rem]"
        type="email"
        bind:field={fields.default.newEmail}
        placeholder="New email"
        floating
        required
      />
      <div class="absolute top-2 right-2 h-12 flex items-center">
        <button
          class="shadow-sm rounded-md bg-blue-100 px-2 py-1 text-blue-900 hover:bg-blue-200 transition-colors duration-300"
          type="submit"
        >
          Update
        </button>
      </div>
    </div>
  </div>
</form>

<Modal class="flex items-center justify-center" title="Reauthenticate" bind:this={modalEl}>
  <ReauthenticateForm on:reauthenticated={handleReauthenticated} />
</Modal>
