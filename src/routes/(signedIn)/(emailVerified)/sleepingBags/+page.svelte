<script>
    import { onMount } from 'svelte';
    import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
    import Card from '$lib/components/Card.svelte';
    import { db } from '$lib/firebase';
  
    let sleepingBags = [];
    let totalSleepingBags = 0;
    let totalVacantBags = 0;
    let totalOccupiedBags = 0;
  
    onMount(async () => {
      const querySnapshot = await getDocs(collection($db, 'sleepingBags'));
      sleepingBags = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      totalSleepingBags = sleepingBags.length;
      totalVacantBags = sleepingBags.filter(bag => !bag.occupied).length;
      totalOccupiedBags = sleepingBags.filter(bag => bag.occupied).length;
    });
  
    const bookSleepingBag = async (id, occupant) => {
      const sleepingBagRef = doc($db, 'sleepingBags', id);
      await updateDoc(sleepingBagRef, {
        occupied: true,
        occupant
      });
      location.reload();
    };
  
    const unreserveSleepingBag = async id => {
      const sleepingBagRef = doc($db, 'sleepingBags', id);
      await updateDoc(sleepingBagRef, {
        occupied: false,
        occupant: ''
      });
    };
  
    const createSleepingBag = async () => {
      const newSleepingBagRef = await addDoc(collection($db, 'sleepingBags'), {
        occupied: false,
        occupant: ''
      });
      sleepingBags.push({
        id: newSleepingBagRef.id,
        occupied: false,
        occupant: ''
      });
      location.reload();
    };
  </script>

  <div class="mt-4">
    <div>Total Sleeping Bags: {totalSleepingBags}</div>
    <div>Total Vacant Bags: {totalVacantBags}</div>
    <div>Total Occupied Bags: {totalOccupiedBags}</div>
  </div>
  <button class="bg-blue-500 text-white px-4 py-2 rounded mt-4" on:click={createSleepingBag}>Create Sleeping Bag</button>
  
  <div class="mt-[2rem] grid grid-cols-4 gap-x-5 gap-y-5">
    {#each sleepingBags as bag}
      <Card>
        <svelte:fragment slot="title">{bag.occupied ? 'Occupied' : 'Vacant'}</svelte:fragment>
        {#if bag.occupied}
          <div>Occupant: {bag.occupant}</div>
          <button class="mt-[1rem] bg-red-500 text-white px-4 py-2 rounded" on:click={() => unreserveSleepingBag(bag.id)}>Unreserve</button>
        {:else}
          <div>Vacant</div>
          <input type="text" bind:value="{bag.occupant}" placeholder="Occupant HHID" class=" mt-[1rem] border border-gray-300 rounded px-3 py-2">
          <button class="mt-[1rem] bg-green-500 text-white px-4 py-2 rounded" on:click={() => bookSleepingBag(bag.id, bag.occupant)}>Book</button>
        {/if}
      </Card>
    {/each}
  </div>
  