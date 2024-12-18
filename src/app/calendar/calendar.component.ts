import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../Services/global.service';
import Imeeting from '../Models/IMeeting';
// import { Route,RouterLink,RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  selectedDate: string = new Date().toISOString().split('T')[0];
  // timeSlots: string[] = Array.from({ length: 24 }, (_, i) =>
  //   i.toString().padStart(2, '0') + ':00'
  // );
  timeSlots: string[] = [];
  meetings: Imeeting[] = [];
  filteredMeetings: Imeeting[] = [];

  constructor(private globalService: GlobalService) {
    // Generate time slots for the calendar
    for (let hour = 0; hour < 24; hour++) {
      const hourString = hour.toString().padStart(2, '0');
      this.timeSlots.push(`${hourString}:00`);
      this.timeSlots.push(`${hourString}:30`);
    }
  }

  ngOnInit(): void {
    // Load meetings for the current date (today)
    this.loadMeetings();
  }

  // Fetch meetings based on the selected date
  loadMeetings(): void {
    const date = this.selectedDate; // Get selected date

    // Call the service to get meetings for the selected date
    this.globalService.getMeetings({ searchDate: date }).subscribe({
      next: (data) => {
        //this.meetings = data.items; // Assuming API response contains 'items'
        // this.filterMeetingsByDate();
        this.filteredMeetings = data.items;
      },
      error: (err) => {
        console.error('Error loading meetings:', err);
      },
    });
  }

  // Filter meetings for the selected date
  // filterMeetingsByDate(): void {
  //   const formattedDate = new Date(this.selectedDate)
  //     .toISOString()
  //     .split('T')[0]; // Normalize selected date
  //   this.filteredMeetings = this.meetings.filter((meeting) => {
  //     const meetingDate = new Date(meeting.date).toISOString().split('T')[0]; // Normalize meeting date
  //     return meetingDate === formattedDate;
  //   });
  //}

  // Triggered when the date changes in the input
  onDateChange(): void {
    this.loadMeetings(); // Load meetings based on the new selected date
  }

  // Get meetings for a specific time slot
  //   getMeetingForSlot(timeSlot: string): Imeeting[] {
  //     const [hours, minutes] = timeSlot.split(':').map(num => parseInt(num, 10));
  //     return this.filteredMeetings.filter(meeting => {
  //       const meetingStart = new Date(meeting.date);
  //       return meetingStart.getHours() === hours && meetingStart.getMinutes() === minutes;
  //     });
  //   }
  // }

  // Get meetings for a specific time slot
  getMeetingForSlot(timeSlot: string): Imeeting[] {
    const [slotHours, slotMinutes] = timeSlot
      .split(':')
      .map((num) => parseInt(num, 10));

    return this.filteredMeetings.filter((meeting) => {
      // Create a Date object from the meeting date and start time
      const meetingStartTime = new Date(meeting.date);
      const [meetingHours, meetingMinutes] = meeting.startTime
        .split(':')
        .map((num) => parseInt(num, 10));
      console.log(meeting.name);
      // Compare the hours and minutes
      return meetingHours === slotHours && meetingMinutes === slotMinutes;
    });
  }
}


