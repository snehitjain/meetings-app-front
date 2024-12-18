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
  styleUrl: './meetings.component.scss'
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

  constructor(private fb: FormBuilder, private globalService: GlobalService) {
    this.searchForm = this.fb.group({
      date: ['today'],
      keywords: [''],
    });

    this.meetingsForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      description: ['', Validators.required],
      attendees: this.fb.array([this.fb.control('', Validators.email)]),
    });
  }

  ngOnInit(): void {
    this.loadMeetings();
  }

  get attendees(): FormArray {
    return this.meetingsForm.get('attendees') as FormArray;
  }

  loadMeetings(): void {
    this.globalService.getMeetings().subscribe({
      next: (data : Imeeting[]) => {
        this.meetings = data;
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
    const { date, keywords } = this.searchForm.value;
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    this.filteredMeetings = this.meetings.filter((meeting) => {
      const matchesDate =
        date === 'today'
          ? meeting.date.split('T')[0] === today
          : date === 'past'
          ? new Date(meeting.date) < new Date()
          : date === 'upcoming'
          ? new Date(meeting.date) > new Date()
          : true;
  
      const matchesKeywords =
        keywords
          ? (meeting.name?.toLowerCase().includes(keywords.toLowerCase()) || 
             (meeting.description && meeting.description?.toLowerCase().includes(keywords.toLowerCase())))
          : true;
  
      return matchesDate && matchesKeywords;
    });
  
    this.showNoMeetingsMessage = this.filteredMeetings.length === 0;
  }  

  selectAttendee(event: Event, meeting: Imeeting): void {
    this.selectedAttendee = (event.target as HTMLSelectElement).value;
  }

  excuseYourself(meeting: Imeeting): void {
    console.log(`Excused from meeting: ${meeting.name}`);
    
    const index = meeting.attendees.findIndex(attendee => attendee.email === this.selectedEmail);
    if (index !== -1) {
      meeting.attendees.splice(index, 1);  // Remove specific attendee
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
    console.log('Start Time:', newMeeting.startTime);
    console.log('End Time:', newMeeting.endTime);
    console.log('Meeting data before submission:', newMeeting);
  
    // Extract hours and minutes from startTime and endTime
    const startTime = newMeeting.startTime;
    const endTime = newMeeting.endTime;
  
    // Function to split time into hours and minutes
    const extractTime = (time: string): { hours: number, minutes: number } => {
      const [hours, minutes] = time.split(':').map((part) => parseInt(part, 10));
      return { hours, minutes };
    };
  
    const formattedStartTime = extractTime(startTime);
    const formattedEndTime = extractTime(endTime);
  
    // Now use the formatted time objects for the meeting
    const formattedNewMeeting: Imeeting = {
      ...newMeeting,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    };
  
    console.log('Formatted meeting data before sending to backend:', formattedNewMeeting);
  
  
    this.globalService.addMeeting(formattedNewMeeting).subscribe(
      (addedMeeting: Imeeting) => {
        this.meetings.push(addedMeeting);
        this.filteredMeetings = [...this.meetings];

        this.filteredMeetings.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA.getTime() - dateB.getTime();
        });

        this.meetingsForm.reset();
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

  addAttendee(): void {
    this.attendees.push(this.fb.control('', Validators.email));
  }

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