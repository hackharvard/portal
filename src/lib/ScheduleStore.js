import { writable } from 'svelte/store'


const ScheduleStore = writable([
    {
      id: 1,
      title: 'Meeting',
      description: 'description',
      date: '2023-10-20',
      start: '2:30',
      location: 'idk',
      end: '3:45',
      category: 'Project'
    }
  ]);

export default ScheduleStore;