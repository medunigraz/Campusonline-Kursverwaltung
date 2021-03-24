export interface CampusOnlineHoldings {
  id: number;
  state: string;
  initiated: string;
  finished: string;
  course_group_term: string;
  room: number;
  entries: Array<any>;
}

export interface CampusonlineholdingStudent {
  manual_entries: Array<any>;
  entries: Array<any>;
  countStudentInLV: number;
  countStundentLeaveLV: number;
  countStudentDiscardLV: number;
  countManualStudentInLV: number;
  countManualStundentLeaveLV: number;
  countManualStudentDiscardLV: number;
}

export interface RunningCourse {
  campusonlineholding: CampusOnlineHoldings;
  campusonlineholdingData: any;
  campusonlineholdingStudent: CampusonlineholdingStudent;
  campusonlineholdingAccreditedStudent: Array<any>;
  campusonlineholdingStudentSearch: Array<any>;
}
