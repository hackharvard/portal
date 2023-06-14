<script>
  import ScheduleStore from "$lib/ScheduleStore.js";
  import { createEventDispatcher } from 'svelte';
  import Input from '$lib/components/Input.svelte'
  import Select from '$lib/components/Select.svelte'
  import { createFields } from '$lib/forms'
  import { alert } from '$lib/stores'
  import {
      datesJson,
      eventCategoriesJson
  } from '$lib/data'

  function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }

  let dispatch = createEventDispatcher();

  let fields = {
  personal: createFields.text(
      'title', 
      'description',
      'date',
      'start',
      'location',
      'end',
      'category')}

  const submitHandler = () => {
    let event = {
        id: generateUniqueId(),
        title: fields.personal.title.value,
        description: fields.personal.description.value,
        date: fields.personal.date.value,
        start: fields.personal.start.value,
        location: fields.personal.location.value,
        end: fields.personal.end.value,
        category: fields.personal.category.value
    };
    ScheduleStore.update(events => {
        return [event, ...events];
    });
    dispatch('add');
  };


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

  function addDuration(time, duration) {
    let d = (duration / 15);
    let end = (d + time > 96 ? d + time - 96 : d + time);
    return convertToTime(end)
  }

  function disableAutocomplete() {
    const input = document.getElementById('myInput');
    input.autocomplete = 'off';
  }
</script>
  
<div class="p-4">
    <h2 class="text-lg font-bold mb-2 ">Create Event</h2>
    
    <form on:submit|preventDefault={submitHandler}>
      <fieldset>
        <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
            <div class="mt-2">
                <Input 
                    for="title"
                    type="text" 
                    placeholder="Event Title" 
                    id="title" 
                    bind:field={fields.personal.title} 
                    floating 
                    required 
                    />
            </div>

            <div class="mt-2">
                <Input 
                    for="description"
                    type="text" 
                    placeholder="Description" 
                    id="description" 
                    bind:field={fields.personal.description} 
                    floating 
                    required />
            </div>
        </div>

        <div class="grid gap-1 sm:grid-cols-2 sm:gap-3">
            <div class="mt-2">
                <Input 
                  for="location"
                  type="text" 
                  placeholder="Location" 
                  id="location" 
                  bind:field={fields.personal.location} 
                  floating 
                  required
                />
            </div> 

            <div class="mt-2">
                <Select
                  bind:field={fields.personal.date}
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
                  bind:field={fields.personal.start} 
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
                  bind:field={fields.personal.end}
                  floating
                  required
                />
            </div>

        </div>
        <div class="mt-4">
          <Select
            bind:field={fields.personal.category}
            name="category"
            autocomplete="category"
            placeholder="Category"
            sourceJson={eventCategoriesJson}
            floating
            required
          />
        </div>
        <button class="rounded-md mt-5 bg-blue-100 px-4 py-2 text-blue-900 shadow-sm transition-colors duration-300 hover:bg-blue-200">Create Event</button>
      </fieldset>
    </form>
</div>

