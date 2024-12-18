import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CalendarComponent } from './calendar/calendar.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { TeamsComponent } from './teams/teams.component';
import { AuthGuard } from './common/auth/auth.guard';


export const routes: Routes = [
    { 
        path: '',
        component:LoginComponent,        
        title:"Login page"
    } ,
    { 
        path: "login",
        component: LoginComponent,
        title:'Login page'
    },
    { 
        path: "calendar",
        component: CalendarComponent,
        title:"calendar",
        canActivate:[AuthGuard]
    },
    { 
        path: "meetings",
        component: MeetingsComponent,
        title:"meetings",
        canActivate:[AuthGuard]
    },
    { 
        path: "teams", 
        component: TeamsComponent,
        title:"teams",
        canActivate:[AuthGuard]
    }
];