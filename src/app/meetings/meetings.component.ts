import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import Imeeting from '../Models/IMeeting';
import { GlobalService } from '../Services/global.service';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.scss',
})
export class MeetingsComponent implements OnInit {
  searchForm: FormGroup;
  meetingsForm: FormGroup;
  meetings: Imeeting[] = [];
  filteredMeetings: Imeeting[] = [];
  showNoMeetingsMessage: boolean = false;
  showForm: boolean = false;
  selectedAttendee: string = '';
  selectedEmail: string = '';
  registeredUsers: any[] = []; // Array to store registered users
  meetingId!: number;

  constructor(private fb: FormBuilder, private globalService: GlobalService) {
    this.searchForm = this.fb.group({
      period: ['present'],
      keywords: [''],
    });

    this.meetingsForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      description: ['', Validators.required],
      attendees: this.fb.array([this.createAttendee()], Validators.required),
    });
  }

  ngOnInit(): void {
    this.loadMeetings();
    this.loadRegisteredUsers();
  }

  // Method to create an attendee (FormGroup)
  createAttendee(): FormGroup {
    return this.fb.group({
      email: ['', Validators.email], // Email
    });
  }
  get attendees(): FormArray {
    return this.meetingsForm.get('attendees') as FormArray;
  }

  loadMeetings(): void {
    this.globalService.getMeetings().subscribe({
      next: (data) => {
        this.meetings = data.items;
        console.log('Meetings loaded:', this.meetings);
        this.filteredMeetings = [...this.meetings];
        this.showNoMeetingsMessage = this.filteredMeetings.length === 0;
      },
      error: (err) => {
        console.error('Error loading meetings:', err);
      },
    });
  }

  getFormattedAttendees(meeting: Imeeting): string {
    return meeting.attendees && meeting.attendees.length > 0
      ? meeting.attendees.map((attendee: any) => attendee.email).join(', ')
      : 'No attendees';
  }

  onSearch(): void {
    const { period, keywords } = this.searchForm.value;

    // Prepare the search parameters
    const searchParams: {
      period?: string;
      searchByName?: string;
      searchByDesc?: string;
    } = {};

    // Period-based filtering
    if (period) {
      searchParams.period = period;
    }

    // Keywords search (name or description)
    if (keywords) {
      searchParams.searchByName = keywords;
      searchParams.searchByDesc = keywords;
    }

    // Fetch meetings based on search criteria
    this.globalService.getMeetings(searchParams).subscribe({
      next: (data) => {
        this.filteredMeetings = data.items;
        console.log('Meetings data:', data); // Check the response
        console.log('searchparmas: ', searchParams);
        this.showNoMeetingsMessage = this.filteredMeetings.length === 0;
      },
    });
  }
  loadRegisteredUsers(): void {
    // Use the AttendeeService to get the list of registered users
    this.globalService.getRegisteredUsers().subscribe(
      (users) => {
        this.registeredUsers = users; // Populate registeredUsers with the fetched data
      },
      (error) => {
        console.error('Error fetching registered users', error);
      }
    );
  }

  selectAttendee(event: any, id: any): void {
    this.selectedEmail = event.target.value;

    this.meetingId = id;
  }

  excuseYourself(meeting: Imeeting): void {
    console.log(`Excused from meeting: ${meeting.name}`);

    const index = meeting.attendees.findIndex(
      (attendee) => attendee.email === this.selectedEmail
    );
    if (index !== -1) {
      meeting.attendees.splice(index, 1); // Remove specific attendee
    }
    this.filteredMeetings = [...this.meetings];
  }

  addMember(meeting: Imeeting): void {
    if (this.selectedEmail.trim() === '') {
      alert('Please select an email from the dropdown!');
      return;
    }

    meeting.attendees.push({ email: this.selectedEmail.trim() });
    this.selectedEmail = '';
    this.filteredMeetings = [...this.meetings];
  }

  showAddMeetingForm(): void {
    this.showForm = true;
  }

  addMeeting(): void {
    if (this.meetingsForm.invalid) {
      return;
    }

    const newMeeting = this.meetingsForm.value;
    // console.log('Start Time:', newMeeting.startTime);
    // console.log('End Time:', newMeeting.endTime);
    console.log('Meeting data before submission:', newMeeting);

    // Extract hours and minutes from startTime and endTime
    const startTime = newMeeting.startTime;
    const endTime = newMeeting.endTime;

    // Filter attendees to only include valid ones (with email)
    const validAttendees = this.attendees.controls
      .map((control) => {
        const email = control.get('email')?.value?.trim();
        return email ? { email } : {}; // If email is not empty, include it, otherwise return an empty object
      })
      .filter((attendee) => Object.keys(attendee).length > 0); // Filter out empty objects

    // Include validAttendees in the new meeting data
    const formattedNewMeeting: Imeeting = {
      ...newMeeting,
      attendees: validAttendees, // Only include attendees with valid emails
    };

    // Log the formatted meeting data to ensure the data structure is correct
    console.log('Formatted meeting data:', formattedNewMeeting);

    this.globalService.addMeeting(formattedNewMeeting).subscribe(
      (addedMeeting: Imeeting) => {
        this.meetings.push(addedMeeting);
        this.filteredMeetings = [...this.meetings];

        this.filteredMeetings.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA.getTime() - dateB.getTime();
        });

        this.meetingsForm.reset({
          period: 'all', // Set default values after reset if necessary
        });
        this.showForm = false;
      },
      (error) => {
        console.error('Error adding meeting:', error);
      }
    );
  }

  removeMeeting(meeting: Imeeting): void {
    const index = this.meetings.indexOf(meeting);
    if (index !== -1) {
      this.meetings.splice(index, 1);
    }
  }

  // addAttendee(): void {
  //   this.attendees.push(this.createAttendee());
  // }
  addAttendee(): void {
    // Create a new attendee form group
    const newAttendee = this.createAttendee();

    // Get the email control from the form group
    const emailControl = newAttendee.get('email');

    // Check if the email is null or empty
    if (emailControl?.value?.trim() === '' || !emailControl?.valid) {
      // If the email is invalid or empty, add an empty object to the attendees array
      this.attendees.push(this.fb.array([])); // Push an empty array
      console.log(
        'Invalid or empty email. Adding an empty object to attendees.'
      );
    } else {
      // If the email is valid, add the attendee to the form array
      this.attendees.push(newAttendee);
    }
  }

  // Method to add the member to the meeting
  addMeetingMember(): void {
    if (this.selectedEmail && this.meetingId) {
      this.globalService
        .addAttendeeToMeeting(this.meetingId, this.selectedEmail)
        .subscribe(
          (response) => {
            console.log('Attendee added successfully:', response);

            this.loadMeetings();
            // Optionally, handle UI updates or show a success message
          },
          (error) => {
            console.error('Error adding attendee:', error);
            // Optionally, show an error message to the user
          }
        );
    } else {
      console.log('Please select a valid user and meeting.');
    }
  }
  // selectedMeetingAttendee(selectedAttendee: string): void {
  //   // Set the selected user email when a user is selected from the dropdown
  //   this.selectedMeetingAttendee = selectedAttendee;
  // }

  removeAttendee(index: number): void {
    if (this.attendees.length > 1) {
      this.attendees.removeAt(index);
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.meetingsForm.reset();
  }
}
