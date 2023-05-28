<!--  Things to do -->
<!--    > make it adjust correctly when screen size adjusts
        > add a form to admin side where ppl can add events to the schedule
        > make it so that when the category of the box is clicked, the related 
          events pop up and when checked, they disappear 
        > how to position correctly on screen?
        >  -->

<script>
  import Input from '$lib/components/Input.svelte';
  import Modal from '$lib/components/Modal.svelte';

    
  // events
  let events = [
      { id: 1, title: "Karaoke", description: "description", time: "2023-04-20T00:10:00", category: "Social"},
      { id: 2, title: "Speaker", description: "description", time: "2023-04-21T14:30:00", category: "Meal" },
      { id: 3, title: "Dinner", description: "description", time: "2023-04-22T18:45:00", category: "Meal" },
      { id: 4, title: "Team Building", description: "description", time: "2023-04-22T19:45:00", category: "Meal" },
      { id: 5, title: "Photo Booth", description: "description ", time: "2023-04-21T17:30:00", category: "Social" },
      { id: 6, title: "Design Time", description: "description", time: "2023-04-22T15:20:00", category: "Project" },
      { id: 7, title: "Tech Talk", description: "description", time: "2023-04-22T15:45:00", category: "Project" }
  
  ];
  
  function organizeEventsByHour(events) {
      let eventDict = {};
  
      events.forEach(event => {
      let eventTime = new Date(event.time);
      let hour = eventTime.getHours();
  
      if (!(hour in eventDict)) {
          eventDict[hour] = [];
      }
  
      eventDict[hour].push(event);
      });
  
      return eventDict;
  }
  
  // dictionary with all the events organized by hour
  let organizedEvents = organizeEventsByHour(events);
  
  function organizeEventsByCategory(events) {
      let eventDict = {};
  
      events.forEach(event => {
      let category = event.category;
      if (!(category in eventDict)) {
          eventDict[category] = [];
      }
      eventDict[category].push(event);
      })
  }
  
  // dictionary with all the events organized by category
  let categorizedEvents = organizeEventsByCategory(events);
  
  function formatTime(dateString) {
          const date = new Date(dateString);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const amOrPm = hours >= 12 ? "pm" : "am";
          const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
          const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
  }
  
  // to make events visible with text boxes
  let VisibleTest = false;
  let VisibleMeal = false;
  let VisibleSocial = false;
  let VisibleWorkshop = false;
  let VisibleProject = false;

  // makes a div for each event
  function eventDiv(events) {
    if (events && events.length > 0) {
      let result = "";
      for (let i = 0; i < events.length; i++) {
        // onclick={() => openModal(${events[i].id})} 
        result += `<div
                    class:hidden={!Visible${events[i].category}}
                    class="bg-blue-200"
                    style="border-radius: 4px;
                          margin-top: 10px;
                          margin-bottom: 10px;
                          padding: 10px;
                          font-weight: bold;"
                    >
                      ${events[i].title}
                    <h2 style="text-align: right;">${formatTime(events[i].time)}</h2>
                  </div>`;
      } return result;

    } else {

      return `<p
                style="background-color: #f6f6f6;
                      border-radius: 4px;
                      padding: 10px;
                      margin-top: 10px;
                      margin-bottom: 10px;" >
                No Events
              </p>`;
    }
  }

  // for testing
  function hideEvents () {
    return `<p 
                  style=" background-color: #f6f6f6;
                          border-radius: 4px;
                          padding: 10px;
                          margin-top: 10px;
                          margin-bottom: 10px; ">
                  No Events </p>`
  }


  // Modal code 
  let selectedEvent = null;

  function openModal(eventId) {
    selectedEvent = events.find(event => event.id === eventId);
  }

  function closeModal() {
    selectedEvent = null;
  }

</script> 
          
<h1 class="mb-8 text-5xl font-bold md:text-6xl">Schedule</h1>

<div class="entire"> 
    <div class="check">
        <h1 class="font-bold text-lg"> Filter </h1>
        <label>
          <input type="checkbox" bind:checked={VisibleTest}/>
          Test
        </label>
        
        <br>
        
        <label>
          <input type="checkbox" bind:checked={VisibleMeal} /> 
          Meals 
        </label>

        <br>

        <label>
          <input type="checkbox" bind:checked={VisibleSocial} /> 
          Social 
        </label>

        <br>

        <label>
          <input type="checkbox" bind:checked={VisibleWorkshop} /> 
          Workshops 
        </label>

        <br>

        <!-- Maybe we can make it so that if they're signed in they can set meeting 
             times with their team (idk if this is necessary) -->
        <label>
          <input type="checkbox" bind:checked={VisibleProject} /> 
          Project 
        </label>

    </div>

    <div class="col_container" style="border: 1px solid #ced4da; margin-bottom: 30px; border-radius: 4px;">
        <div class="columns">
            <div>
                <p> 12 am </p>
                {@html eventDiv(organizedEvents[0])}
            </div>
            <div>
                <p> 1 am </p>
                <div class:hidden={!VisibleTest} onclick={() => openModal(3)} class="example1">
                  Speaker Event
                </div>
                <div class:hidden={!VisibleTest} onclick={() => openModal(3)} class="example1">
                  Other Event
                </div>
                {#if !VisibleTest}
                  {@html hideEvents()}
                {/if}
            </div>
            <div>
                <p> 2 am </p>
                {@html eventDiv(organizedEvents[2])}
            </div>
            <div>
                <p> 3 am </p>
                {@html eventDiv(organizedEvents[3])}
            </div>
            <div>
                <p> 4 am </p>
                {@html eventDiv(organizedEvents[4])}
            </div>
            <div>
                <p> 5 am </p>
                {@html eventDiv(organizedEvents[5])}
            </div>
            <div>
                <p> 6 am </p>
                {@html eventDiv(organizedEvents[6])}
            </div>
            <div>
                <p> 7 am </p>
                {@html eventDiv(organizedEvents[7])}
            </div>
        </div>

        <div class="columns">
            <div>
                <p> 8 am </p>
                {@html eventDiv(organizedEvents[8])}
            </div>
            <div>
                <p> 9 am </p>
                {@html eventDiv(organizedEvents[9])}
            </div>
            <div>
                <p> 10 am </p>
                {@html eventDiv(organizedEvents[10])}
            </div>
            <div>
                <p> 11 am </p>
                {@html eventDiv(organizedEvents[11])}
            </div>
            <div>
                <p> 12 am </p>
                {@html eventDiv(organizedEvents[12])}
            </div>
            <div>
                <p> 1 pm </p>
                {@html eventDiv(organizedEvents[13])}
            </div>
            <div>
                <p> 2 pm </p>
                {@html eventDiv(organizedEvents[14])}
            </div>
            <div>
                <p> 3 pm </p>
                {@html eventDiv(organizedEvents[15])}
            </div>
        </div>

        <div class="columns">
            <div>
                <p> 4 pm </p>
                {@html eventDiv(organizedEvents[16])}
            </div>
            <div>
                <p>5 pm</p>
                {@html eventDiv(organizedEvents[17])}
            </div>
            <div>
                <p> 6 pm </p>
                {@html eventDiv(organizedEvents[18])}
            </div>
            <div>
                <p> 7 pm </p>
                {@html eventDiv(organizedEvents[19])}
            </div>
            <div>
                <p> 8 pm </p>
                {@html eventDiv(organizedEvents[20])}
            </div>
            <div>
                <p> 9 pm </p>
                {@html eventDiv(organizedEvents[21])}
            </div>
            <div>
                <p> 10 pm </p>
                {@html eventDiv(organizedEvents[22])}
            </div>
            <div>
                <p> 11 pm </p>
                <div class:hidden={!VisibleTest} class="example1">
                  Social Event
                </div>
                {#if !VisibleTest}
                  {@html hideEvents()}
                {/if}
            </div>
        </div>
    </div>
</div>


{#if selectedEvent}
    <div class="modal">
    <div class="modal-content">
        <h2>{selectedEvent.title}</h2>
        <p>{selectedEvent.description}</p>
        <button on:click={closeModal}>Close</button>
    </div>
    </div>
{/if}





<style>
  .columns {
    border-color: black;
    margin: 10px;
    width: 330px;
    border-style: none solid none none;
  }

  .col_container {
      display: grid;
      grid-template-columns: auto auto auto auto;
      background-color: rgba(217, 216, 216, 0);
      margin-right: 80px;

  }

  .check {
      background-color: rgba(182, 175, 175, 0.285);
      padding: 10px;
      font-size: 13px;
      margin-right: 20px;
      /* margin-left: 10px; */
      margin-bottom: 30px;
      border-radius: 4px;
      
  }

  .entire {
      display: grid;
      grid-template-columns: auto auto auto auto;
      margin-right: 100px;
      position: absolute;
      right: 0;

  }

  .example1 {
      background-color: rgb(230, 152, 230);
      border-radius: 4px;
      margin-top: 10px;
      margin-bottom: 10px;
      padding: 10px;
      font-weight: bold; 

  }

  .category-meal {
      background-color: red;
  }

  .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 100;
  }

  .modal-content {
      background-color: #fff;
      padding: 20px;
      max-width: 80%;
      max-height: 80%;
      overflow-y: auto;
      border-radius: 8px;
  }

  .modal-close {
      cursor: pointer;
      margin-top: 16px;
      text-align: center;
      font-weight: bold; 
      /* color: #bf0603; */
      font-family: 'Readex Pro', sans-serif;
  }

  .hidden {
    display: none;
  }
</style>
