import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
})
export class TeamsComponent {
  teams = [
    {
      name: 'Development Team',
      shortName: '@dev',
      description: 'Handles all development tasks.',
      members: ['john@example.com', 'joe@example.com'],
    },
    {
      name: 'Marketing Team',
      shortName: '@mkt',
      description: 'Handles all marketing campaigns.',
      members: ['sam@example.com', 'ram@example.com'],
    },
  ];

  users = [
    'sujan@example.com',
    'suvham@example.com',
    'debasis@example.com',
    'charu@example.com',
  ];
  selectedMember: { [key: string]: string } = {};
  showAddTeamForm = false;

  newTeam = {
    name: '',
    shortName: '',
    description: '',
    members: [],
  };

  toggleTeamForm() {
    this.showAddTeamForm = !this.showAddTeamForm;
  }

  createTeam() {
    this.teams.push({ ...this.newTeam, members: [] });
    this.newTeam = { name: '', shortName: '', description: '', members: [] };
    this.toggleTeamForm();
  }

  addMemberToTeam(team: any) {
    if (this.selectedMember[team.shortName]) {
      team.members.push(this.selectedMember[team.shortName]);
      this.selectedMember[team.shortName] = '';
    }
  }

  excuseYourself(team: any) {
    const memberToRemove = this.selectedMember[team.shortName];
    if (memberToRemove) {
      const index = team.members.indexOf(memberToRemove);
      if (index !== -1) {
        team.members.splice(index, 1);
        console.log(`${memberToRemove} has been removed from the team.`);
      }
      this.selectedMember[team.shortName] = '';
    }
  }
}
