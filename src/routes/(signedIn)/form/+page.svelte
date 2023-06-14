<script>
  import AddEventForm from "../../../lib/forms/AddEventForm.svelte"
  import EditEvent from "../../../lib/forms/EditEvent.svelte"
</script>
<div class="grid md:grid-cols-3">
    <h1 class="mb-8 text-5xl font-bold md:text-6xl">Add Event</h1>
    <div class="col-span-2 flex flex-col items-center gap-6">
      <AddEventForm />
      <EditEvent />
    </div>
  </div>