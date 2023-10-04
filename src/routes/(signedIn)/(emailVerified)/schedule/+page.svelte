<!--  Things to do -->
<!--    > add a form to admin side where ppl can add events to the schedule
        > 15 minute long events? 
        > overlap -->

        <script lang="ts">
            import { onMount } from 'svelte';
            import { writable } from 'svelte/store';
            import ScheduleStore from "$lib/ScheduleStore.js";
            import {
                  format,
                  parseISO,
                  addMinutes,
                  isBefore,
                  isAfter,
                  isEqual,
                  parse,
                } from 'date-fns';

            

          
          
            let timeslots = [
              "12:00 am", "1:00 am", "2:00 am", "3:00 am", "4:00 am", "5:00 am",
              "6:00 am", "7:00 am", "8:00 am", "9:00 am", "10:00 am", "11:00 am",
              "12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm",
              "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm", "11:00 pm"
            ];
          
            let items = Array.from({ length: 48 }, (_, i) => i + 1);
          
            function calWidth(col: number): number{
              if (col === 1) {
                return 32.50
              } else if (col == 2) {
                return 48.60
              } else {
                return 98
              }
            }
          
            function convertToMinutes(time: string): number{
              let timeParts = time.split(":");
              let hours = parseInt(timeParts[0]);
              let minutes = parseInt(timeParts[1]);
            
              let totalMinutes = (hours * 60) + minutes;
              return totalMinutes;
            }
          
            function convertInputTime(startTime: string): number {
              let s = startTime.toString();
              return (convertToMinutes(s) / 15) + 1
            }
          
            function convertInputDate(eventDate: number): number {
                let e = eventDate.toString();
                if (e === '2023-10-20') {
                    return 1;
                } else if (e === '2023-10-21') {
                    return 2;
                } else if (e === '2023-10-22') {
                    return 3;
                }
                
                return 0;
            }
          
            function eventColor(category: string): string {
                if (category === 'Networking and Community Building') {
                    return 'rgba(112, 214, 255, .75)';
                } else if (category === 'Meals') {
                    return 'rgba(255, 112, 166, .75)';
                } else if (category === 'Learning and Skill Development') {
                    return 'rgba(255, 151, 112, .75)';
                } else if (category === 'Project') {
                    return 'rgba(233, 255, 112, .75)';
                }

                // Return a default color if none of the conditions are met
                return 'defaultColor'; // You can choose any appropriate default color
            }

          
            const selectedEventId = writable(null);
            const showModal = writable(false);
          
            function openModal(eventId: number): void {
                    selectedEventId.set(eventId);
                    showModal.set(true);
            }

          
            function closeModal() {
              selectedEventId.set(null);
              showModal.set(false);
            }
            
            function unformatTime(formattedTime: string): string {
              // Parse the formatted time with AM/PM
              const parsedTime = parse(formattedTime, 'hh:mm a', new Date());

              // Format the parsed time to 'hh:mm' format
              return format(parsedTime, 'hh:mm');
            }
                      
          
          </script>
          
          <div class="grid md:grid-cols-3">
          
          <h1 class="mb-8 text-5xl font-bold md:text-6xl">Schedule</h1>
          
          <div class="col-span-2 mt-32">
          
          <div class="calendar-container">
          
            <div class="bg-blue-100">
            </div>
            
            <div class="header bg-blue-100">
              <ul class="weekdays">
                <li>Day 1</li>
                <li>Day 2</li>
                <li>Day 3</li>
              </ul>
            </div>
          
            <div class="timeslots-container bg-gray-100">
              <ul class="timeslots">
                {#each timeslots as timeslot}
                  <li class="flex items-center">{timeslot}</li>
                {/each}
              </ul>
            </div>
          
          
            <div class="event-container border border-gray-200 shadow">
              <div class="event-background"></div>
              {#each $ScheduleStore as event (event.id)}
                <div key={event.id} class="slot" style={`height: ${(convertInputTime(event.end) - convertInputTime((event.start))) * 15}px; grid-row: ${convertInputTime(event.start)}; grid-column: ${convertInputDate(event.date)}; width:${calWidth(convertInputDate(event.date))}%; background-color:${eventColor(event.category)} `} on:click={() => openModal(event.id)}>
                  <div class="event-status"></div>
                  <div class="ml-2 font-bold" style={`margin-top: ${((convertInputTime(event.end) - convertInputTime(event.start)) * 15) === 30 ? '.05px' : '2px'}; word-wrap: break-word;`}>
                    <span>{event.title}</span>
                  </div>
                </div>
              {/each}
          
              {#each items as item}
                <div class="grid-line"></div>
                <div style="height: 30px"></div>
              {/each}
            </div>
          </div>
          </div>
          </div>
          
          {#if $showModal && $selectedEventId !== null}
            {#each $ScheduleStore as item}
              {#if item.id === $selectedEventId}
                <div class="modal">
                  <div class="modal-content rounded-md">
                    <div class="mt-5 mb-5 ml-5">
                      <h2 class="font-bold text-2xl">{item.title}</h2>
                      <p class="mt-2"><strong> Description: </strong>{item.description}</p>
                      <p class="mt-2"><strong> Location: </strong> {item.location}</p>
                      <p class="mt-2"> <strong> Date: </strong>{item.date}</p>
                      <p class="mt-2"> <strong> Time: </strong> {item.start} - {item.end}</p>
                      <button class="rounded-md mt-5 bg-blue-100 px-4 py-2 text-blue-900 shadow-sm transition-colors duration-300 hover:bg-blue-200"on:click={closeModal}>Close Modal</button>
                    </div>
                  </div>
                </div>
              {/if}
            {/each}
          {/if}
          
          
          <style>
            .modal {
              width: 100%;
              left: 0;
              top: 0;
              right: 0;
              position: fixed;
              height: 100%;
              overflow: auto;
              z-index: 8;
              background-color: rgba(0, 0, 0, 0.2);
              display: flex;
              justify-content: center;
              align-items: center;
            }
          
            .modal-content {
              background-color: #fff;
              margin: 15% auto;
              padding: 20px;
              width: 400px;
            }
          
            .event-background {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 0;
            }
          
            .grid-line {
              grid-column: 1 / span 3;
              height: 1px;
              background-color: rgba(0, 0, 0, 0.253);
              z-index: 1;
            }
          
            li {
              list-style: none;
            }
          
            ul {
              margin: 0px;
              padding: 0px;
            }
          
            .calendar-container {
              display: grid;
              margin-top: -50px;
              margin-right: 50px;
              grid-template-columns: 100px auto;
              grid-template-rows: auto;
              gap: 1px 1px;
              grid-template-areas:
                ". header"
                "timeslots-container main";
            }
          
            .weekdays{
              display: grid;
              grid-template-columns: repeat(3, 1fr);
            }
          
            .weekdays {
              display: flex;
              justify-content: space-around;
              list-style: none;
              padding: 0;
              margin: 0;
              font-weight: bold;
            }
          
            .header {
              grid-area: header;
              /* border-radius: 4px;
              border-width: 1px; */
              /* background-color: #f2f2f2; */
              padding: 10px;
              /* border-bottom: 1px solid #ddd; */
            }
          
            .timeslots-container {
              /* border-radius: 4px; */
              border-width: 1px;
              /* background: white; */
              font-size: .9rem;
          
              grid-area: timeslots-container;
              justify-items: left;
            }
          
            .timeslots {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
          
            .timeslots li {
              height: 60px;
              border-bottom: 1px solid black;
            }
          
            .event-container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(96, 15px);
              background: white;
              grid-area: main;
              position: relative;
              white-space: nowrap;
              overflow: hidden;
              border-radius: 4px;
              z-index: 0;
            }
          
          
            .event-container::before,
            .event-container::after {
              content: "";
              position: absolute;
              top: 0;
              bottom: 0;
              width: 1px;
              background-color: rgba(0, 0, 0, 0.253);
            }
          
            .event-container::before {
              left: 33.3333%;
          
            }
          
            .event-container::after {
              left: 66.6666%;
          
            }
          
            .event-container .slot {
              position: absolute;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          
            .slot {
              position: absolute;
              border-radius: 5px;
              z-index: 2;
              margin-top: 1px;
              border-color: rgb(3, 155, 229);
              outline: none;
            }
          
            .slot::before {
              -webkit-box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.2);
              box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12),
                0 3px 5px -1px rgba(0, 0, 0, 0.2);
              opacity: 0;
              transition: opacity 100ms linear;
            }
          
            .slot::after {
              position: absolute;
              top: -1px;
              left: -1px;
              width: -webkit-calc(100% + 2px);
              width: calc(100% + 2px);
              height: -webkit-calc(100% + 2px);
              height: calc(100% + 2px);
              content: "";
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
              -webkit-border-radius: 5px;
              border-radius: 5px;
              pointer-events: none;
              border: 1px solid #fff;
            }
          
            .event-status {
              float: left;
              border-left: 3px solid #00aaff;
              height: 100%;
            }
          </style>