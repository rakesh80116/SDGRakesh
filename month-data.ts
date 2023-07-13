export interface MonthData {
  id: number;
  project_id: number;
  week: string;
  person: string;
  hours_worked: number;
  task: string;
  month: string;
  project: string; // Add the 'project' property of type string
}
