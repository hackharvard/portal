<script>
  import ScheduleStore from "$lib/ScheduleStore.js";
  import Input from '$lib/components/Input.svelte';
  import Select from '$lib/components/Select.svelte'
  import { createFields } from '$lib/forms'
  import {
          datesJson,
          eventCategoriesJson,
      } from '$lib/data'
 
 function convertToMinutes(time) {
    let timeParts = time.split(":");
    let hours = parseInt(timeParts[0]);
    let minutes = parseInt(timeParts[1]);
  
    let totalMinutes = (hours * 60) + minutes;
    return totalMinutes;
  }

  function convertInputTime(startTime) {
      let s = startTime.toString();
      return (convertToMinutes(s) / 15) + 1
    }

  function convertToTime(time) {
    let t = (time - 1) * 15;
    let x = t / 60;
    if (t < 60) {
      let new_time = ['12', (t.toString() === '0' ? '00' : t.toString())]
      return (new_time.join(':') + ' am')
    } else {
      if (x > 12) {
        if (x < 13) {
          let minutes = (x - 12) * 15 / .25;
          let new_time = ['12', (minutes.toString() === '0' ? '00' : minutes.toString())];
          return (new_time.join(':') + ' pm')
        } else {
          let hour = (Math.floor(x - 12));
          let minutes = (x - 12 - hour) * 15 / .25;
          let new_time = [hour.toString(), (minutes.toString() === '0' ? '00' : minutes.toString())];
          return (new_time.join(':') + ' pm')
        }
      } else {
        let hour = Math.floor(x)
        let minutes = (x - hour) * 15 / .25
        let new_time = [hour.toString(), (minutes.toString() === '0' ? '00' : minutes.toString())]
        let z = (hour === 12 ? ' pm' : ' am');
      return (new_time.join(':') + z)
      }
    }
  }

  function toggleEditMode(event) {
    event.editMode = !event.editMode;
    if (event.editMode) {
      fields.default.title.value = event.title;
      fields.default.description.value = event.description;
      fields.default.date.value = event.date;
      fields.default.start.value = event.start;
      fields.default.location.value = event.location;
      fields.default.end.value = event.end;
      fields.default.category.value = event.category;
    } else {
      updateEvent(event);
    }
  }

  function deleteEvent(eventId) {
    ScheduleStore.update(events => {
      const updatedEvents = events.filter(e => e.id !== eventId);
      return updatedEvents;
    });
  }

  let fields = {
    default: createFields.text(
      'title', 
      'description',
      'date',
      'start',
      'location',
      'end',
      'category'
    )
  }

  function updateEvent(event) {
    ScheduleStore.update((storedEvents) => {
      const updatedEvents = storedEvents.map((e) => {
        if (e.id === event.id) {
          // Update the event's properties only if the fields are changed
          if (fields.default.title.value !== event.title) {
            e.title = fields.default.title.value;
          }
          if (fields.default.description.value !== event.description) {
            e.description = fields.default.description.value;
          }
          if (fields.default.date.value !== event.date) {
            e.date = fields.default.date.value;
          }
          if (fields.default.start.value !== event.start) {
            e.start = fields.default.start.value;
          }
          if (fields.default.location.value !== event.location) {
            e.location = fields.default.location.value;
          }
          if (fields.default.end.value !== event.end) {
            e.end = fields.default.end.value;
          }
          if (fields.default.category.value !== event.category) {
            e.category = fields.default.category.value;
          }
        }
        return e;
      });
      return updatedEvents;
    });
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
        placeholder="Event Title" 
        id="title" 
        bind:field={fields.default.title}
        floating 
      />
      <Input 
        for="description"
        type="text" 
        placeholder="Description" 
        id="start" 
        bind:field={fields.default.description} 
        floating 
      />
    </div>

    <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
      <div class="mt-2">
        <Input 
          for="location"
          type="text" 
          placeholder="Location" 
          id="location" 
          bind:field={fields.default.location} 
          floating 
        />
      </div>
      <div class="mt-2">
        <Select
          bind:field={fields.default.date}
          name="date"
          autocomplete="date"
          placeholder="Date"
          sourceJson={datesJson}
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
          placeholder="Start Time" 
          id="start" 
          bind:field={fields.default.start} 
          floating 
          required
        />
      </div> 
      <div class="mt-2">
        <Input 
          for="end"
          type="time" 
          placeholder="End Time" 
          id="end" 
          bind:field={fields.default.end} 
          floating 
          required 
        />
      </div> 
    </div>

    <div class="mt-4">
      <Select
        bind:field={fields.default.category}
        name="category"
        autocomplete="category"
        placeholder="Category"
        sourceJson={eventCategoriesJson}
        floating
        required
        />
    </div>
  </fieldset>
</form>
  {:else}
  <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
  <div class="mt-3 pl-3 bg-white rounded-md mb-2">
    <strong>Title: </strong> {event.title}
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
    <strong> Start Time:</strong> {convertToTime(convertInputTime(event.start))}
  </div>
  <div class="bg-white rounded-md mb-2">
    <strong> End Time:</strong> {convertToTime(convertInputTime(event.end))}
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