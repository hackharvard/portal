import { writable } from 'svelte/store'


const ScheduleStore = writable([
    {
      id: 1,
      title: 'Meeting',
      description: 'Going over updates and new tasks',
      date: '2023-10-20',
      start: '2:30 AM',
      location: 'Room 108',
      end: '3:45 AM',
      category: 'Project',
      editMode: false
    }
  ]);

export default ScheduleStore;