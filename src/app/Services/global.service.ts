import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Imeeting from '../Models/IMeeting';
import { Observable } from 'rxjs';
import { IRUser } from '../Models/IRUser';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private apiUrl = 'https://localhost:7097';
  constructor(private http: HttpClient) {}

  // getCalenderItems(date:string)
  // {
  //   return this.http.get<ICalender[]>(`https://localhost:7097/api/calendar?date=2024-12-13`);
  // }

  // getMeetings() {
  //   return this.http.get<Imeeting[]>(`${this.apiUrl}/api/Meetings`);
  //}
  getMeetings(
    params: {
      searchDate?: string;
      period?: string;
      searchByName?: string;
      searchByDesc?: string;
    } = {}
  ): Observable<any> {
    let httpParams = new HttpParams();

    if (params.searchDate) {
      httpParams = httpParams.append('searchDate', params.searchDate); // Pass searchDate to the API
    }
    if (params.period) {
      httpParams = httpParams.append('period', params.period); // Pass period if needed
    }
    if (params.searchByName) {
      httpParams = httpParams.append('searchByName', params.searchByName);
    }
    if (params.searchByDesc) {
      httpParams = httpParams.append('searchByDesc', params.searchByDesc);
    }

    return this.http.get<Imeeting[]>(`${this.apiUrl}/api/Meetings`, {
      params: httpParams,
    });
  }

  addMeeting(meetingData: Omit<Imeeting, 'id'>): Observable<Imeeting> {
    return this.http.post<Imeeting>(
      `${this.apiUrl}/api/Meetings`,
      meetingData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  // Fetch all registered users from the API
  getRegisteredUsers(): Observable<IRUser[]> {
    return this.http.get<IRUser[]>(`${this.apiUrl}/api/Attendee/users`);
  }

  // Method to add an attendee to a meeting
  addAttendeeToMeeting(meetingId: number, email: string): Observable<any> {
    const body = {
      meetingId,
      email,
    };
    // Send POST request to the backend API
    return this.http.post(`${this.apiUrl}/api/Attendee/Add`, body, {
      responseType: 'text',
    });
  }

  removeAttendeeFromMeeting(meetingId: number): Observable<any> {
    const body = { meetingId };  
    return this.http.delete<any>(`${this.apiUrl}/api/Attendee/Remove`, {body});
  }

  // getTeams(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/api/teams`);
  // }

  // // Add a new team to the backend
  // addTeam(teamData: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/api/teams`, teamData, {
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  // }

  // getMeetingsById(meetingsId: number) {
  //   return this.http.get<Imeeting>(`${this.apiUrl}/workshops/${workshopId}`);
  // }
}
