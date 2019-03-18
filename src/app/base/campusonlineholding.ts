export interface CampusOnlineHoldings {
  id: number;
  state: string;
  initiated: string;
  finished: string;
  course_group_term: string;
  room: number;
  entries: Array<any>;
}
