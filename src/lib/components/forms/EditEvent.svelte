<script lang="ts">
  import ScheduleStore from "$lib/ScheduleStore.js";
  import Input from '$lib/components/Input.svelte';
  import Select from '$lib/components/Select.svelte'
  import {
          datesJson,
          eventCategoriesJson,
      } from '$lib/data'
  import {
        format,
        parseISO,
      } from 'date-fns';


  interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    start: string;
    location: string;
    end: string;
    category: string;
    editMode: boolean;
  }



  function toggleEditMode(event: Event): void {
    event.editMode = !event.editMode;
    if (event.editMode) {
      fields.title = event.title;
      fields.description = event.description;
      fields.date = event.date;
      fields.start = event.start;
      fields.location = event.location;
      fields.end = event.end;
      fields.category = event.category;
      fields.editMode = event.editMode;
    } else {
      updateEvent(event);
    }
  }

  
  function deleteEvent(eventId: number): void {
    ScheduleStore.update(events => {
      const updatedEvents = events.filter(e => e.id !== eventId);
      return updatedEvents;
    });
  }

  let fields = {
      title: '', 
      description: '',
      date: '',
      start:'',
      location: '',
      end: '',
      category: '',
      editMode: false
  }

  function updateEvent(event: Event): void {
    ScheduleStore.update((storedEvents) => {
      const updatedEvents = storedEvents.map((e) => {
        if (e.id === event.id) {
          // Update the event's properties only if the fields are changed
          if (fields.title !== e.title) {
            fields.title = e.title;
          }
          if (fields.description !== e.description) {
            e.description = fields.description;
          }
          if (fields.date !== e.date) {
            e.date = fields.date;
          }
          if (fields.start !== e.start) {
            e.start = fields.start;
          }
          if (fields.location !== e.location) {
            e.location = fields.location;
          }
          if (fields.end !== e.end) {
            e.end = fields.end;
          }
          if (fields.category !== e.category) {
            e.category = fields.category;
          }
        }
        return e;
      });
      return updatedEvents;
    });
  }

  function formatTime(field: string): string {
      // Check if the field is a valid time string
      const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(field);

      if (isValidTime) {
        // If it's a valid time string, format it
        const parsedTime = parseISO(`2000-01-01T${field}`);
        return format(parsedTime, 'h:mm a'); // 'h:mm a' format adds AM/PM without leading zero
      } else {
        // If it's not a valid time string, return an empty string or an error message
        return field;
      }
  }

</script>

<div style="margin-right: 370px">
  <h2 class="font-bold text-lg"> Event List </h2>
</div>

{#each $ScheduleStore as event}
  <div class="rounded-md p-3 border-slate-300" style=" width: 460px; border-width: 1px;">
{#if event.editMode}

<form>
  <fieldset>
    <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
      <Input 
        for="title"
        type="text" 
        label="Event Title" 
        id="title" 
        bind:value={fields.title}
        floating 
        required
      />
      <Input 
        for="description"
        type="text" 
        label="Description" 
        id="start" 
        bind:value={fields.description} 
        floating 
        required
      />
    </div>

    <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
      <div class="mt-2">
        <Input 
          for="location"
          type="text" 
          label="Location" 
          id="location" 
          bind:value={fields.location} 
          floating 
          required
        />
      </div>
      <div class="mt-2">
        <Select
          bind:value={fields.date}
          name="date"
          autocomplete="date"
          label="Date"
          options={datesJson}
          floating
          required
        />
      </div>
    </div>

    <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
      <div class="mt-2">
        <Input 
          for="start"
          type="time" 
          label="Start Time" 
          id="start" 
          bind:value={fields.start} 
          floating 
          required
        />
      </div> 
      <div class="mt-2">
        <Input 
          for="end"
          type="time" 
          label="End Time" 
          id="end" 
          bind:value={fields.end} 
          floating 
          required 
        />
      </div> 
    </div>

    <div class="mt-4">
      <Select
        bind:value={fields.category}
        name="category"
        autocomplete="category"
        label="Category"
        options={eventCategoriesJson}
        floating
        required
        />
    </div>
  </fieldset>
</form>
  {:else}
  <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
    <div class="mt-3 pl-3 bg-white rounded-md mb-2">
      <strong>Title: </strong> {event.id}
    </div>
    <div class="mt-3 bg-white rounded-md mb-2">
      <strong>Description: </strong> {event.description}
    </div>
  </div>
  <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
    <div class="pl-3 bg-white rounded-md mb-2">
      <strong>Location:</strong> {event.location}
    </div>
    <div class=" bg-white rounded-md mb-2">
      <strong> Date:</strong> {event.date}
    </div>
  </div>
  <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
    <div class="pl-3 bg-white rounded-md mb-2">
      <strong> Start Time:</strong> {formatTime(event.start)}
    </div>
    <div class="bg-white rounded-md mb-2">
      <strong> End Time:</strong> {formatTime(event.end)}
    </div>
  </div>
  <div class="pl-3 bg-white rounded-md">
    <strong> Category:</strong> {event.category} <br>
  </div>
  {/if}
  <div class="ml-3 pb-2">
    <button class="rounded-md bg-gray-100 px-4 py-2 text-gray-900 shadow-sm transition-colors duration-300 hover:bg-gray-200" on:click={() => toggleEditMode(event)}>{#if event.editMode}Save{:else}Edit{/if}</button>
    <button class="ml-2 rounded-md mt-5 bg-blue-100 px-4 py-2 text-blue-900 shadow-sm transition-colors duration-300 hover:bg-blue-200" on:click={() => deleteEvent(event.id)}>Delete</button>
  </div>
</div>
{/each}