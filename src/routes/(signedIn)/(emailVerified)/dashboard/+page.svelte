<script lang="ts">
  import { db, user, storage } from '$lib/client/firebase'
  import Card from '$lib/components/Card.svelte'
  import Dialog from '$lib/components/Dialog.svelte'
  import DialogActions from '$lib/components/DialogActions.svelte'
  import Link from '$lib/components/Link.svelte'
  import Loading from '$lib/components/Loading.svelte'
  import PageLayout from '$lib/components/PageLayout.svelte'
  import ConfirmationForm from '$lib/components/forms/ConfirmationForm.svelte'
  import { getDoc, doc } from 'firebase/firestore'
  import { fade } from 'svelte/transition'
  import Button from '$lib/components/Button.svelte'
  import { onMount } from 'svelte'

  let pdfUrl =
    'https://raw.githubusercontent.com/hackharvard/portal/7c95d9c559956a4a4f414583a05a9391f2d25d76/certificates.pdf'
  let pageNumber = 0

  let text = ''
  let cantFind = false
  onMount(() => {
    return user.subscribe(async (user) => {
      if (!user) return
      const data = await fetch(
        'https://raw.githubusercontent.com/hackharvard/portal/main/src/data.csv',
      )
      text = await data.text()
      const rows = text.split('\n')
      const headers = rows[0].split(',')
      const fullNameIndex = headers.indexOf('team member')
      const fullName = user.profile.firstName + ' ' + user.profile.lastName
      const fullNameRow = rows.find(
        (row) => row.split(',')[fullNameIndex] === fullName,
      )
      if (fullNameRow) {
        const fullNameRowNumber = rows.indexOf(fullNameRow)
        pageNumber = fullNameRowNumber
      } else {
        cantFind = true
      }
    })
  })

  let fullName = ''

  // when full name changes
  $: {
    if (fullName) {
      const rows = text.split('\n')
      const headers = rows[0].split(',')
      const fullNameIndex = headers.indexOf('team member')
      const fullNameRow = rows.find(
        (row) =>
          row.split(',')[fullNameIndex].toLowerCase() ===
          fullName.toLowerCase(),
      )
      if (fullNameRow) {
        const fullNameRowNumber = rows.indexOf(fullNameRow)
        pageNumber = fullNameRowNumber
      }
    }
  }

  async function downloadCertificate() {
    if (pdfUrl) {
      const pdfjs = await import('pdfjs-dist')
      // pdfjs.GlobalWorkerOptions.workerSrc = '/src/pdf.worker.js'
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry')
      pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

      const pdf = await pdfjs.getDocument(pdfUrl).promise
      const page = await pdf.getPage(pageNumber)

      const scale = 8.0 // Increase the scale for even higher resolution
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // Get the image data from the canvas as a high-resolution PNG
      const imageData = canvas.toDataURL('image/png', 1.0) // 1.0 quality for high resolution

      // Create a download link for the PNG
      const a = document.createElement('a')
      a.href = imageData
      a.download = `certificate.png`
      a.click()
    }
  }

  type ApplicationStatus = Data.Decision | 'submitted' | null
  type DashboardData = {
    application: {
      status: ApplicationStatus
    }
  }
  let dialogEl: Dialog
  let loading = true
  let data: DashboardData = {
    application: {
      status: null,
    },
  }
  user.subscribe((user) => {
    if (user) {
      let timer: number
      Promise.all([
        new Promise<void>((resolve) => {
          timer = window.setTimeout(resolve, 400)
        }),
        new Promise<void>((resolve) => {
          getDoc(doc(db, '2024-applications', user.object.uid)).then(
            (snapshot) => {
              if (snapshot.exists()) {
                const applicationData =
                  snapshot.data() as Data.Application<'client'>
                if (applicationData.meta.submitted) {
                  data.application.status = 'submitted'
                  getDoc(doc(db, '2024-decisions', user.object.uid)).then(
                    (snapshot) => {
                      if (snapshot.exists()) {
                        data.application.status = snapshot.data()
                          .type as Data.Decision
                      }
                      resolve()
                    },
                  )
                } else {
                  resolve()
                }
              } else {
                resolve()
              }
            },
          )
        }),
      ]).then(() => {
        loading = false
      })
      return () => window.clearTimeout(timer)
    }
  })
</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<Dialog bind:this={dialogEl} size="full">
  <svelte:fragment slot="title">Hacker Guide</svelte:fragment>
  <div slot="description" class="space-y-4">
    <iframe
      class="h-[calc(100vh-300px)] w-full"
      src="https://docs.google.com/document/d/e/2PACX-1vSG9CCzX3-K99gWP7SjdzaxQ9APRbbhXi2pwlWiFig2q9sbFh3TDjkFY7BQZj3dZXRgf-Ed6VKIqBRc/pub?embedded=true"
    ></iframe>
    <DialogActions>
      <Button on:click={dialogEl.cancel}>Close</Button>
    </DialogActions>
  </div>
</Dialog>

<PageLayout cols={2}>
  <svelte:fragment slot="title">Dashboard</svelte:fragment>
  <div class="relative w-full">
    {#if loading}
      <Loading
        class="absolute left-0 right-0 top-0 h-[calc(100vh-216px-80px)] md:h-[calc(100vh-216px)]"
      />
    {:else}
      <div
        class="space-y-6"
        transition:fade={{
          duration: 500,
        }}
      >
        <Card class="space-y-4">
          <h2 class="text-xl font-bold">Application Status</h2>
          {#if data.application.status === null}
            <div class="space-y-1">
              <p>
                Early applications are due on <span class="font-bold"
                  >August 31</span
                >
                at 11:59 PM EDT. Regular applications are due on
                <span class="font-bold">September 10</span>. Applications
                submitted past the deadline will not be considered for
                admission.
              </p>
            </div>
          {/if}
          <div class="space-y-4">
            <p>
              {#if data.application.status === 'accepted'}
                You have been accepted to HackHarvard 2024! We look forward to
                seeing you.
              {:else if data.application.status === 'waitlisted'}
                You have been waitlisted. We will follow up with more
                information!
              {:else if data.application.status === 'rejected'}
                Unfortunately, we have decided not to accept you for this year's
                hackathon. We are open to appeals if-and-only-if you were part
                of the early application cycle and most of your intended team
                was accepted. If this is the case, contact us at
                <Link href="mailto:team@hackharvard.io"
                  >team@hackharvard.io</Link
                >. You have until September 14th to appeal.
              {:else if data.application.status === 'submitted'}
                Your application is submitted and in review!
              {:else}
                Your application is in progress. Make sure to submit by the
                deadline!
              {/if}
            </p>
            <Link href="/apply">View application</Link>
            <!-- {#if data.application.status === 'accepted'}
              <div>
                <button
                  on:click={dialogEl.open}
                  class="inline-block border-b border-black text-black transition-colors duration-300 hover:border-gray-600 hover:text-gray-600"
                  >Hacker Guide</button
                >
              </div>
            {/if} -->

            <!-- {#if data.application.status === 'accepted' && cantFind}
              <p>
                To get your certificate, please enter your name just as you
                filled it out on the presubmission form below. If no result
                appears below, please contact us at <a
                  href="mailto:team@hackharvard.io">team@hackharvard.io</a
                >.
              </p>
              <input
                type="text"
                class="w-full rounded-md border border-gray-300 px-4 py-2"
                bind:value={fullName}
              />
            {/if}

            {#if data.application.status === 'accepted' && pageNumber > 0}
              <div>
                <button
                  on:click={() => downloadCertificate()}
                  class="inline-block border-b border-black text-black transition-colors duration-300 hover:border-gray-600 hover:text-gray-600"
                  >Download certificate of completion</button
                >
              </div>
            {/if} -->
          </div>
        </Card>
        {#if data.application.status === 'accepted'}
          <Card class="space-y-4">
            <ConfirmationForm />
          </Card>
        {/if}
      </div>
    {/if}
  </div>
</PageLayout>
