import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { ToastrService } from 'ngx-toastr';


interface Role {
  username: string;
  password: string;
  role: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  
  isLoggedIn: boolean = false;
  username: string = '';
  password: string = '';
  weekData: any[] = [];
  currentUserRole: string = '';
  selectedstartDate: string;
  savedstartDate: string;
  selectedendDate: string;
  savedendDate: string;
  selectedMonth: any = null; // Assign null as initial value
  months: any[] = []; // Array to store months fetched from the database
  selectedYear: string; // Assign null as initial value
  weeklyData: any[] = [];
  selectedDate: Date;
  monthlyData: any[] = [];
  tasks: any[];
  taskDates: { startDate: Date, endDate: Date }[] = []; // Object to store task start and end dates
  selectedView: string;
  projects: any[];
  selectedProject: any;
  listtasks: any[];
  selectedProjectId: string;
  selectedTask: any[];
  users: any[];
  roles: Role[] = [];
  selectedUser: string; // New property to store the selected user
  newTask: any = {}; // Object to store the new task
  editedTask: any = {}; // Object to store the edited task
  selectedProjectName: string;

  constructor(private dataService: DataService, private http: HttpClient, private toastr: ToastrService) {
    this.selectedDate = new Date();
    this.tasks = [];
    this.selectedProjectName = '';
    this.selectedstartDate = '';
    this.savedstartDate = '';
    this.selectedendDate = '';
    this.savedendDate = '';
    this.selectedMonth = null;
    this.selectedYear = '';
    this.selectedView = 'month';
    this.projects = [];
    this.selectedProject = null;
    this.selectedUser = '';
    this.users = [];
    this.listtasks = [];
    this.selectedTask = [];
    this.getRoles();
    this.selectedProjectId = '';
  }

  ngOnInit() {
    const savedstartDate = sessionStorage.getItem('selectedstartDate');
    if (savedstartDate) {
      this.selectedstartDate = savedstartDate;
      this.savedstartDate = savedstartDate;
    }

    const savedEndDate = sessionStorage.getItem('selectedendDate');
    if (savedEndDate) {
      this.selectedendDate = savedEndDate;
      this.savedendDate = savedEndDate;
    }

    const savedTaskDates = sessionStorage.getItem('taskDates');
if (savedTaskDates) {
  this.taskDates = JSON.parse(savedTaskDates);
}


    const savedUserRole = sessionStorage.getItem('currentUserRole');
    if (savedUserRole) {
      this.currentUserRole = savedUserRole;
      this.isLoggedIn = true;
    }

    this.getListTasks();
    this.getProjects();
    this.getUsers();
    this.getTasks();
    this.fetchMonths();
    this.fetchDataByMonth();
    // Update the date every day
    setInterval(() => {
      this.selectedDate = new Date();
    }, 86400000); // 86400000 milliseconds = 24 hours
  }

  setRole(role: string) {
    this.currentUserRole = role;
  }

  saveStartDate() {
    sessionStorage.setItem('selectedstartDate', this.selectedstartDate);
    this.savedstartDate = this.selectedstartDate;
  }

  saveEndDate() {
    sessionStorage.setItem('selectedendDate', this.selectedendDate);
    this.savedendDate = this.selectedendDate;
  }
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  login(username: string, password: string) {
    this.dataService.login(username, password).subscribe(
      (response) => {
        const matchedRole = response.role;
        if (matchedRole) {
          this.setRole(matchedRole);
          this.isLoggedIn = true;
          sessionStorage.setItem('currentUserRole', matchedRole);
          this.toastr.success('Login successful!', 'Success');
        } else {
          this.toastr.error('Invalid username or password', 'Error');
        }
      },
      (error) => {
        console.error(error);
        this.toastr.error('Login failed', 'Error');
      }
    );
  }

  getRoles() {
    this.dataService.getRoles().subscribe(
      (response: Role[]) => {
        this.roles = response;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUserRole = '';
    sessionStorage.removeItem('currentUserRole');
    this.toastr.info('Logged out successfully!', 'Logout');
  }

  goBack() {
    window.location.reload();
  }

  getProjects() {
    this.dataService.getProjects().subscribe(
      (data: any[]) => {
        this.projects = data;
      },
      (error) => {
        console.log('Error:', error);
      }
    );
  }

  updateClientAndHours(projectId: string) {
    console.log('Project ID:', projectId);
    this.dataService.getProjectById(projectId).subscribe(
      (projectData) => {
        this.selectedProject = projectData[0];
      },
      (error) => {
        console.error('Error fetching project data:', error);
      }
    );
  }

  getUsers() {
    this.dataService.getUsers().subscribe(
      (response: any[]) => {
        this.users = response;
        if (this.users.length > 0) {
          this.selectedUser = this.users[0].name; // Set the initial selected user
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getTasks() {
    this.dataService.getTasks().subscribe(
      (response: any[]) => {
        this.tasks = response;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getListTasks() {
    this.dataService.getListTasks().subscribe(
      (response: any[]) => {
        this.listtasks = response;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  editTask(task: any) {
    this.editedTask = { ...task };
  }

  addTask() {
    this.newTask.startdate = this.selectedstartDate;
    this.newTask.enddate = this.selectedendDate;
    this.dataService.addTask(this.newTask).subscribe(
      (response: any) => {
        console.log(response);
        this.tasks.push(response);
        this.newTask = {}; // Clear the newTask object after adding a task
        this.toastr.success('Task added successfully', 'Success');
      },
      (error) => {
        console.error(error);
        this.toastr.error('Failed to add task', 'Error');
      }
    );
  }
  
  updateTask() {
    this.dataService.updateTask(this.editedTask.id, this.editedTask).subscribe(
      (response: any) => {
        console.log('Task updated successfully');
        this.getTasks();
        this.editedTask = {};
        this.toastr.success('Task updated successfully', 'Success');
      },
      (error) => {
        console.error(error);
        this.toastr.error('Failed to update task', 'Error');
      }
    );
  }

  deleteTask(task: any) {
    const confirmDelete = confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
      this.dataService.deleteTask(task.id).subscribe(
        () => {
          console.log('Task deleted successfully');
          this.tasks = this.tasks.filter((t) => t.id !== task.id);
          this.toastr.success('Task deleted successfully', 'Success');
        },
        (error) => {
          console.error(error);
          this.toastr.error('Failed to delete task', 'Error');
        }
      );
    }
  }

  fetchMonths() {
    this.dataService.getMonths().subscribe(
      (data: any[]) => {
        this.months = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  fetchDataByMonth() {
    if (this.selectedMonth && this.selectedProject) {
      const selectedMonthName = this.selectedMonth.name;
      const currentYear = new Date().getFullYear();
      const selectedProjectName = this.selectedProject.project_name;

      this.dataService.getWeekDataByMonthAndYear(selectedMonthName, currentYear, selectedProjectName)
        .subscribe(
          (data) => {
            this.weekData = data;
            console.log('Selected Month:', this.selectedMonth);
            console.log('Selected Project ID:', this.selectedProjectId);
          },
          (error) => {
            console.error(error);
          }
        );
    }
  }

  getRowSpan(weekNumber: number): number {
    return this.weekData.filter(data => data.week_number === weekNumber).length;
  }

  onProjectChange() {
    this.selectedProject = this.projects.find(project => project.id === this.selectedProjectId);
    console.log('Selected Project ID:', this.selectedProjectId);
    console.log('Selected Project:', this.selectedProject);
  }
}


