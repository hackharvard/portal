<script lang="ts">
  import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    Timestamp,
  } from 'firebase/firestore'
  import Input from '$lib/components/Input.svelte'
  import Select from '$lib/components/Select.svelte'
  import Textarea from '$lib/components/Textarea.svelte'
  import { fade } from 'svelte/transition'
  import {
    gendersJson,
    schoolsJson,
    shirtSizeJson,
    dietaryRestrictionsJson,
    rolesJson,
    raceJson,
    prolangsJson,
    statesJson,
    worldJson,
    majorJson,
    reasonsJson,
    experienceJson,
    levelOfStudyJson,
  } from '$lib/data'
  import { alert } from '$lib/stores'
  import { onDestroy, onMount } from 'svelte'
  import Card from '$lib/components/Card.svelte'
  import Form from '$lib/components/Form.svelte'
  import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
  import { db, storage, user } from '$lib/client/firebase'
  import { cloneDeep, isEqual } from 'lodash-es'
  import Field from '$lib/components/Field.svelte'
  import Button from '../Button.svelte'
  import Link from '../Link.svelte'
  import { cn } from '$lib/utils'

  let disabled = true
  let showValidation = false
  let dbValues: Data.Application<'client'>
  const targetDate = new Date('2024-08-31T23:59:59-04:00') // August 31st, 11:59:59 PM
  let currentDate = new Date()
  let formSubmittable = currentDate < targetDate
  setInterval(() => {
    currentDate = new Date()
    formSubmittable = currentDate < targetDate
  }, 1000) // Check every second

  let values: Data.Application<'client'> = {
    personal: {
      email: '',
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      race: [],
      underrepresented: '',
      phoneNumber: '',
      countryOfResidence: '',
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      shippingCountry: '',
      shippingZipCode: '',
      dietaryRestrictions: [],
    },
    academic: {
      enrolled: false,
      currentSchool: '',
      graduationYear: '',
      major: '',
      affiliated: false,
      levelOfStudy: '',
    },
    hackathon: {
      shirtSize: '',
      firstHackathon: false,
      previouslyParticipated: false,
      ableToAttend: false,
      reason: '',
    },
    openResponse: {
      roles: [],
      otherRole: '',
      prolangs: [],
      otherProlang: '',
      experience: '',
      whyHh: '',
      project: '',
      unlimitedResource: '',
      resume: {
        url: '',
        name: '',
      },
      resumeShare: false,
    },
    agreements: {
      codeOfConduct: false,
      sharing: false,
      mlhEmails: false,
      submitting: false,
    },
    meta: {
      hhid: '',
      uid: '',
      submitted: false,
      decision: null,
    },
    timestamps: {
      created: serverTimestamp() as Timestamp,
      updated: serverTimestamp() as Timestamp,
    },
  }
  let resumeFile: File
  let saveInterval: number | undefined = undefined
  onMount(() => {
    return user.subscribe((user) => {
      if (user) {
        getDoc(doc(db, '2024-applications', user.object.uid)).then(
          (applicationDoc) => {
            const applicationExists = applicationDoc.exists()
            if (applicationExists) {
              const applicationData =
                applicationDoc.data() as Data.Application<'client'>
              values = cloneDeep(applicationData)
              dbValues = cloneDeep(applicationData)
              if (
                !values.meta.submitted &&
                (values.personal.email !== user.object.email ||
                  values.personal.firstName !== user.profile.firstName ||
                  values.personal.lastName !== user.profile.lastName)
              ) {
                values.personal.email = user.object.email as string
                values.personal.firstName = user.profile.firstName
                values.personal.lastName = user.profile.lastName
                handleSave()
              }
            } else {
              values.meta.uid = user.object.uid
              values.meta.hhid = user.profile.hhid
              values.personal.email = user.object.email as string
              values.personal.firstName = user.profile.firstName
              values.personal.lastName = user.profile.lastName
              handleSave()
            }
            if (!values.meta.submitted) {
              disabled = false
              if (saveInterval === undefined) {
                saveInterval = window.setInterval(() => {
                  handleSave()
                }, 300000)
              }
            }
          },
        )
      }
    })
  })

  onDestroy(() => {
    clearInterval(saveInterval)
    saveInterval = undefined
  })
  function modifiedValues() {
    return {
      ...values,
      timestamps: {
        ...values.timestamps,
        updated: serverTimestamp(),
      },
    }
  }
  function handleSave(disable: boolean = false) {
    if (!disabled) {
      showValidation = false
      if (disable) {
        disabled = true
      }
      return new Promise<void>((resolve, reject) => {
        if ($user) {
          const frozenUser = $user
          setDoc(
            doc(db, '2024-applications', frozenUser.object.uid),
            modifiedValues(),
          )
            .then(() => {
              getDoc(doc(db, '2024-applications', frozenUser.object.uid)).then(
                (applicationDoc) => {
                  const applicationData =
                    applicationDoc.data() as Data.Application<'client'>
                  values = cloneDeep(applicationData)
                  dbValues = cloneDeep(applicationData)
                  if (disable) {
                    disabled = false
                  }
                  alert.trigger('success', 'Your application was saved.')
                  resolve()
                },
              )
            })
            .catch((err) => {
              if (disable) {
                disabled = false
              }
              console.log(err)
              alert.trigger('error', err.code, true)
              reject()
            })
        }
      })
    }
  }
  function uploadFile(file: File, filePath: string) {
    const fileRef = ref(storage, filePath)
    return new Promise((resolve, reject) =>
      uploadBytes(fileRef, file)
        .then(() => {
          getDownloadURL(fileRef).then((url) => {
            resolve(url)
          })
        })
        .catch(reject),
    )
  }
  function handleSubmit(e: CustomEvent<SubmitData>) {
    if (!formSubmittable) {
      alert.trigger(
        'error',
        'The HackHarvard application deadline has passed. Your application will not be submitted.',
      )
    }
    if ($user) {
      const frozenUser = $user
      if (e.detail.error === null) {
        showValidation = false
        disabled = true
        uploadFile(resumeFile, `resumes/${frozenUser.object.uid}.pdf`)
          .then((downloadURL) => {
            values.openResponse.resume = {
              url: downloadURL as string,
              name: resumeFile.name,
            }
            values.meta.submitted = true
            setDoc(
              doc(db, '2024-applications', frozenUser.object.uid),
              modifiedValues(),
            )
              .then(() => {
                alert.trigger('success', 'Your application has been submitted!')
                getDoc(
                  doc(db, '2024-applications', frozenUser.object.uid),
                ).then((applicationDoc) => {
                  fetch('/api/application', {
                    method: 'POST',
                  }).then(async (res) => {
                    if (!res.ok) {
                      const { message } = await res.json()
                      console.log(message)
                    }
                    const applicationData =
                      applicationDoc.data() as Data.Application<'client'>
                    clearInterval(saveInterval)
                    saveInterval = undefined
                    values = cloneDeep(applicationData)
                    dbValues = cloneDeep(applicationData)
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    })
                    alert.trigger(
                      'success',
                      'Your application has been submitted!',
                    )
                  })
                })
              })
              .catch((err) => {
                disabled = false
                alert.trigger('error', err.code, true)
              })
          })
          .catch(() => {
            disabled = false
            alert.trigger('error', 'Error uploading resume. Please try again.')
          })
      } else {
        showValidation = true
        alert.trigger('error', e.detail.error)
      }
    }
  }
  function handleUnload(e: BeforeUnloadEvent) {
    if (!isEqual(dbValues, values)) {
      e.preventDefault()
      e.returnValue = 'Save changes before leaving?'
      return 'Save changes before leaving?'
    }
  }
</script>

<svelte:window on:beforeunload={handleUnload} />
{#if formSubmittable || values.meta.submitted}
  <Form
    class={cn('max-w-2xl', showValidation && 'show-validation')}
    on:submit={handleSubmit}
  >
    <fieldset class="space-y-14" {disabled}>
      {#if values.meta.submitted}
        <div
          class="rounded-md bg-green-100 px-4 py-2 text-center text-green-900 shadow-sm"
        >
          Application submitted!
        </div>
      {:else}
        <Card>
          Please note that applications are due on <b
            >August 31st 2024 at 11:59 EDT</b
          > Your application is not currently submitted.
        </Card>
        <Card>
          Please refer to the <Link href="/faq">FAQ</Link> for information on eligibility
          before you begin the application. Additionally, you may
          <b>save your application</b> and finish later by clicking the button at
          the end of this form.
        </Card>
      {/if}
      <div class="grid gap-4">
        <span class="text-2xl font-bold">Personal</span>
        <Card class="space-y-3">
          <Field>
            {`Name: ${values.personal.firstName} ${values.personal.lastName}`}
          </Field>
          <Field>{`Email: ${values.personal.email}`}</Field>
          <div class="text-sm">
            {#if values.meta.submitted}
              The above name and email was the copy submitted on your
              application.
            {:else}
              Wrong name or email? Go to your <a class="link" href="/profile"
                >profile</a
              > to update your information. Once you submit, updates on your profile
              won't be reflected on your application.
            {/if}
          </div>
        </Card>
        {#if values.openResponse.resume.url !== ''}
          <a
            href={values.openResponse.resume.url}
            target="_blank"
            rel="noreferrer"
          >
            <Card class="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span>{`${values.openResponse.resume.name} (resume)`}</span>
            </Card>
          </a>
        {/if}
        <Input
          class="w-24"
          type="number"
          bind:value={values.personal.age}
          label="How old will you be on October 11th, 2024?"
          min="0"
          max="100"
          required
        />
        <Select
          bind:value={values.personal.gender}
          label="Gender"
          options={gendersJson}
          floating
          required
        />
        <div class="grid gap-1">
          <span>Race / ethnicity (check all that apply)</span>
          <div class="grid grid-cols-2">
            {#each raceJson as race}
              <Input
                type="checkbox"
                bind:value={values.personal.race}
                label={race.name}
              />
            {/each}
          </div>
        </div>
        <Select
          bind:value={values.personal.underrepresented}
          label="Do you identify as part of an underrepresented group in the technology industry?"
          options={[{ name: 'Yes' }, { name: 'No' }, { name: 'Unsure' }]}
          required
        />
        <Input
          type="tel"
          bind:value={values.personal.phoneNumber}
          label="Phone number"
          floating
          required
          pattern="[\d\s\-\+]+"
        />
        <Select
          bind:value={values.personal.countryOfResidence}
          label="Country of residence"
          options={worldJson}
          floating
          required
        />
        <Input
          type="text"
          bind:value={values.personal.shippingAddress}
          label="Shipping Address"
          floating
          required
        />
        <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
          <Input
            type="text"
            bind:value={values.personal.shippingCity}
            label="City"
            floating
            required
          />
          <Select
            bind:value={values.personal.shippingState}
            label="State"
            options={statesJson}
            floating
            required
          />
        </div>
        <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
          <Select
            bind:value={values.personal.shippingCountry}
            label="Country"
            options={worldJson}
            floating
            required
          />
          <Input
            type="text"
            bind:value={values.personal.shippingZipCode}
            label="Zip code"
            floating
            required
          />
        </div>
        <div class="mt-2 grid gap-1">
          <span> Do you have any dietary restrictions?</span>
          <div class="grid grid-cols-2">
            {#each dietaryRestrictionsJson as dietaryRestriction}
              <Input
                type="checkbox"
                bind:value={values.personal.dietaryRestrictions}
                label={dietaryRestriction.name}
              />
            {/each}
          </div>
        </div>
      </div>
      <div class="grid gap-4">
        <span class="text-2xl font-bold">Academic</span>
        <Select
          bind:value={values.academic.levelOfStudy}
          label="What is your current education level?"
          options={levelOfStudyJson}
          floating
          required
        />
        <Input
          type="checkbox"
          bind:value={values.academic.enrolled}
          label="Will you be pursuing an undergraduate degree program at a university on October 11th, 2024?"
          required
        />
        <div class="grid gap-1 sm:grid-cols-3 sm:gap-3">
          <div class="sm:col-span-2">
            <Select
              bind:value={values.academic.currentSchool}
              label="Current school"
              options={schoolsJson}
              floating
              required
            />
          </div>
          <Input
            type="number"
            bind:value={values.academic.graduationYear}
            label="Graduation year"
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 20}
            floating
            required
          />
        </div>
        <Select
          bind:value={values.academic.major}
          label="Major / field of study"
          options={majorJson}
          floating
          required
        />
        <Input
          type="checkbox"
          bind:value={values.academic.affiliated}
          label="Are you affiliated with Harvard University? If so, make sure
          your profile uses your Harvard email."
          validations={[
            [
              values.academic.affiliated &&
                !values.personal.email.includes('harvard'),
              'If you are affiliated, please go to your profile to change to a Harvard email.',
            ],
          ]}
        />
      </div>
      <div class="grid gap-4">
        <span class="text-2xl font-bold">Hackathon</span>
        <div class="grid grid-cols-2 sm:grid-cols-3">
          <Select
            bind:value={values.hackathon.shirtSize}
            label="Shirt size"
            options={shirtSizeJson}
            floating
            required
          />
        </div>
        <Input
          type="checkbox"
          bind:value={values.hackathon.firstHackathon}
          label="Will HackHarvard be your first hackathon?"
        />
        {#if !values.hackathon.firstHackathon}
          <Input
            type="checkbox"
            bind:value={values.hackathon.previouslyParticipated}
            label="Have you previously participated at a HackHarvard hackathon?"
          />
        {/if}
        <Input
          type="checkbox"
          bind:value={values.hackathon.ableToAttend}
          label="HackHarvard is an in-person event. Will you be able to be in Cambridge, MA, United States, considering both the legal requirements for international students and the logistical aspects, on October 11th, 2024?"
          required
        />
        <Select
          bind:value={values.hackathon.reason}
          label="How did you learn about HackHarvard?"
          options={reasonsJson}
          required
        />
      </div>
      <div class="grid gap-4">
        <span class="text-2xl font-bold">Open Response</span>
        <div class="grid gap-1">
          <span>
            What roles best fit your capabilities on a hackathon team?<span
              class="text-red-500"
            >
              *
            </span>
          </span>
          <div class="grid grid-cols-2 gap-2">
            {#each rolesJson as role}
              <Input
                type="checkbox"
                bind:value={values.openResponse.roles}
                label={role.name}
              />
            {/each}
          </div>
          {#if values.openResponse.roles.includes('other')}
            <Textarea
              bind:value={values.openResponse.otherRole}
              label="If other, what other roles could you see yourself playing? (200 char limit)"
              required
              rows={1}
              maxlength={200}
            />
          {/if}
        </div>
        <div class="grid gap-1">
          <span>
            Check up to 5 of the programming languages that you feel most
            comfortable in.<span class="text-red-500"> * </span>
          </span>
          <div class="grid grid-cols-2 gap-2">
            {#each prolangsJson as prolang}
              <Input
                type="checkbox"
                bind:value={values.openResponse.prolangs}
                label={prolang.name}
                validations={[
                  [
                    values.openResponse.prolangs.length > 5,
                    'Check up to 5 programming languages only.',
                  ],
                ]}
                required
              />
            {/each}
          </div>
          {#if values.openResponse.prolangs.includes('other')}
            <Textarea
              bind:value={values.openResponse.otherProlang}
              label="If other, what other programming languages? (200 char limit)"
              required
              rows={1}
              maxlength={200}
            />
          {/if}
        </div>
        <Select
          bind:value={values.openResponse.experience}
          label="How much experience do you have with computer science?"
          options={experienceJson}
          required
        />
        <Textarea
          bind:value={values.openResponse.whyHh}
          label={`Share your goals and aspirations for this event and how you plan to make the most of your HackHarvard experience. What specific areas are you eager to learn more about, and what skills or technologies are you excited to acquire or improve? (500 char limit)`}
          required
          maxlength={500}
        />
        <Textarea
          bind:value={values.openResponse.project}
          label={`HackHarvard is all about sparking creativity and making a positive difference through innovative projects. We'd love to hear about a project you've been part of that embodies this spirit. How did your project bring a touch of magic or create a lasting impact, whether big or small, on the people or community it reached? (500 char limit)`}
          required
          maxlength={500}
        />
        <Textarea
          bind:value={values.openResponse.unlimitedResource}
          label={`Imagine you have access to the latest technology and unlimited resources. How would you leverage these tools to solve any societal problem of your choosing? (500 char limit)`}
          required
          maxlength={500}
        />
        {#if values.openResponse.resume.url === ''}
          <div>
            <Input
              bind:value={resumeFile}
              type="file"
              label="Upload your resume (max 1 MB; 1 page PDF)"
              maxSize={1 * 1024 * 1024}
              accept={['application/pdf']}
              required
            />
            <div class="mt-1 text-sm">
              Only upload when you are ready to submit. The draft does <span
                class="font-bold">not</span
              > save your resume.
            </div>
          </div>
        {/if}
        <Input
          type="checkbox"
          bind:value={values.openResponse.resumeShare}
          label="If you are accepted to HackHarvard 2024, would you like us to share your resume with our sponsors for potential recruitment opportunities?"
        />
      </div>
      <div class="grid gap-4">
        <span class="text-2xl font-bold">Agreements</span>
        <Input
          type="checkbox"
          bind:value={values.agreements.codeOfConduct}
          label="I have read and agree to the MLH Code of Conduct (https://static.mlh.io/docs/mlh-code-of-conduct.pdf)."
          required
        />
        <Input
          type="checkbox"
          bind:value={values.agreements.sharing}
          label="I authorize you to share my application/registration information with Major League Hacking for event administration, ranking, and MLH administration in-line with the MLH Privacy Policy (https://mlh.io/privacy). I further agree to the terms of both the MLH Contest Terms and Conditions (https://github.com/MLH/mlh-policies/blob/main/contest-terms.md)and the MLH Privacy Policy (https://mlh.io/privacy)"
          required
        />
        <Input
          type="checkbox"
          bind:value={values.agreements.mlhEmails}
          label="I authorize MLH to send me occasional emails about relevant events, career opportunities, and community announcements."
        />
        <Input
          type="checkbox"
          bind:value={values.agreements.submitting}
          label="I understand submitting means I can no longer make changes to my application. Don't check this box until you are sure that you are ready to submit."
          required
        />
      </div>
      {#if !values.meta.submitted && formSubmittable}
        <div class="grid grid-cols-2 gap-3">
          <Button on:click={() => handleSave(true)}>Save draft</Button>
          <Button color="blue" type="submit">Submit</Button>
        </div>
      {/if}
    </fieldset>
  </Form>
{:else}
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
      The deadline to apply to HackHarvard was August 31st at 11:59 PM EDT,
      which has passed. This message indicates that we did not receive a
      completed application from you. If you believe this to be a mistake,
      contact
      <a href="mailto:tech@hackharvard.io">tech@hackharvard.io</a>.
    </div>
  </div>
{/if}
