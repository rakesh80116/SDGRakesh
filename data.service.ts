import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = 'http://localhost:7000';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/login`;
    const body = { username, password };
    return this.http.post<any>(url, body);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/roles`);
  }

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects`);
  }

  getProjectById(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/projects/${projectId}`);
  }


  getMonths(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/months`);
  }


  getWeekDataByMonthAndYear(month: string, year: number, projectName: string): Observable<any[]> {
    const url = `${this.baseUrl}/weeklydata/${month}/${year}?projectName=${projectName}`;
    return this.http.get<any[]>(url);
  }

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/clients`);
  }

  getHours(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/hours`);
  }

  getListTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/listoftasks`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks`);
  }

  addTask(newTask: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/addtasks`, newTask);
  }

  updateTask(taskId: string, updatedTask: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/tasks/${taskId}`, updatedTask);
  }

  deleteTask(taskId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/tasks/${taskId}`);
  }
  getProject(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/projects/${projectId}`);
  }
}
