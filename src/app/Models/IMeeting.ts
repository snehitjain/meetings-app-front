interface IMeetingsResponse {
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  items: Meeting[];
}
interface Attendee {
  // userId: string;
  email: string;
}

// interface Time {
//   hours: number;
//   minutes: number;
// }

interface Meeting {
  id?: number;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: Attendee[];
}

export type { Attendee };
export default Meeting;
