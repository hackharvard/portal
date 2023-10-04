<script lang="ts">
    import ScheduleStore from "$lib/ScheduleStore.js";
    import { createEventDispatcher } from 'svelte';
    import Input from '$lib/components/Input.svelte'
    import Select from '$lib/components/Select.svelte'
    import {
        datesJson,
        eventCategoriesJson
    } from '$lib/data'
  
    function generateUniqueId() {
      return Math.random().toString(36).substring(2, length + 2);
    }
  
    let dispatch = createEventDispatcher();
  
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
  

    const submitHandler = () => {

        const event: {
            id: number;
            title: string;
            description: string;
            date: string;
            start: string;
            location: string;
            end: string;
            category: string;
            editMode: boolean;
        } = {
            id: Number(generateUniqueId()), 
            title: fields.title,
            description: fields.description,
            date: fields.date,
            start: fields.start,
            location: fields.location,
            end: fields.end,
            category: fields.category,
            editMode: fields.editMode
        };

        ScheduleStore.update((events) => {
            return [event, ...events];
        });

        dispatch('add');
    };

  
  
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
                      label="Event Title" 
                      id="title" 
                      bind:value={fields.title} 
                      floating 
                      required 
                      />
              </div>
  
              <div class="mt-2">
                  <Input 
                      for="description"
                      type="text" 
                      label="Description" 
                      id="description" 
                      bind:value={fields.description} 
                      floating 
                      required />
              </div>
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
                    autocomplete="off"
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
              label="Category"
              options={eventCategoriesJson}
              floating
              autocomplete="off"
              required
            />
          </div>
          <button class="rounded-md mt-5 bg-blue-100 px-4 py-2 text-blue-900 shadow-sm transition-colors duration-300 hover:bg-blue-200">Create Event</button>
        </fieldset>
      </form>
  </div>
  
  