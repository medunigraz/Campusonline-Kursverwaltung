import {Routes} from "@angular/router";
import {CourseListComponent } from './courseList/courseList.component';

export const APP_ROUTES: Routes = [
  {
    path: 'kursverwaltung',
    component: CourseListComponent
  },
  {
    path: '',
    redirectTo: 'kursverwaltung',
    pathMatch: 'full'
  }
]
