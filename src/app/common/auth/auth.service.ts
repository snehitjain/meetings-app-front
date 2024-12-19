import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable ,of} from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const apiUrl = 'https://localhost:7097';

export interface ICredentials {
  username: string;
  password: string;
}

export interface ILoginResponse {
  email: string;
  authToken: string;
}



@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private static KEY_USER = 'user';

  private currentUserSubject: BehaviorSubject<ILoginResponse | null>;
  public currentUser: Observable<ILoginResponse | null>;

  constructor(private http: HttpClient) {
    const user = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<ILoginResponse | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private getStoredUser(): ILoginResponse | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(AuthenticationService.KEY_USER);
      return user ? JSON.parse(user) : null;
    }
    return null; // For non-browser environments (e.g., server-side rendering)
  }

  login(credentials: ICredentials): Observable<ILoginResponse> {
    return this.http
      .post<ILoginResponse>(`${apiUrl}/api/Auth/Login`, credentials, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        map((resp) => {
          if (resp && resp.authToken) {
            // Store user details and JWT token in local storage
            if (typeof window !== 'undefined') {
              localStorage.setItem(
                AuthenticationService.KEY_USER,
                JSON.stringify(resp)
              );
              this.currentUserSubject.next(resp);
            }
          }
          return resp;
        })
      );
  }
  // Register method
  register(registerData: ICredentials): Observable<string> {
    return this.http
      .post(`${apiUrl}/api/Auth/Register`, registerData, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'text',  
      })
      .pipe(
        map((response:string) => {
          // On successful registration, return a success message
          return response;
        }),
        catchError((error) => {
          // Handle registration error
          console.error('Registration failed:', error);
          // Log the full error response for debugging
          console.log('Full error response:', error);
          return of('An error occurred during registration. Please try again later.');
          //throw error;
         
         
         
        })
      );
  }
  logout(): void {
    if (typeof window !== 'undefined') {
      // Remove user from local storage and set current user to null
      localStorage.removeItem(AuthenticationService.KEY_USER);
      this.currentUserSubject.next(null);
    }
  }

  getUser(): ILoginResponse | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }
}
