import {HeaderComponent } from './header/header.component';
import {CourseListComponent } from './courseList/courseList.component';
import {PagingComponent} from './paging/paging.component';
import {CourseNamePipe} from './pipes/courseName.pipe';

import {APP_ROUTES} from './app.routes';
import {RouterModule} from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER  } from '@angular/core';

import { OAuthModule } from 'angular-oauth2-oidc';

import { CourseService } from './services/course.service';
import { RoomService } from './services/room.service';
import { AppLoadService } from './services/app-load.service';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CovalentLayoutModule } from '@covalent/core/layout';
import { CovalentStepsModule  } from '@covalent/core/steps';
/* any other core modules */
// (optional) Additional Covalent Modules imports
import { CovalentHttpModule } from '@covalent/http';
import { CovalentHighlightModule } from '@covalent/highlight';
import { CovalentMarkdownModule } from '@covalent/markdown';
import { CovalentDynamicFormsModule } from '@covalent/dynamic-forms';
import { CovalentMessageModule } from '@covalent/core/message';
import { CovalentPagingModule } from '@covalent/core/paging';
import { CovalentLoadingModule } from '@covalent/core/loading';
import { CovalentExpansionPanelModule } from '@covalent/core/expansion-panel';
import { CovalentDialogsModule } from '@covalent/core/dialogs';

import {MatButtonModule, MatNativeDateModule} from '@angular/material';
import {MatMenuModule} from '@angular/material/menu'
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

import { AppComponent } from './app.component';

export function get_login(appLoadService: AppLoadService) {
    console.log('APP_INITIALIZER STARTING');
    return () => appLoadService.getLogin();
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CourseListComponent,
    PagingComponent,
    CourseNamePipe
  ],
  imports: [
    RouterModule.forRoot(APP_ROUTES),

    BrowserModule,
    BrowserAnimationsModule,

    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatIconModule,
    MatInputModule,
    MatGridListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,

    CovalentLayoutModule,
    CovalentStepsModule,
    CovalentHttpModule.forRoot(),
    CovalentHighlightModule,
    CovalentMarkdownModule,
    CovalentDynamicFormsModule,
    CovalentMessageModule,
    CovalentPagingModule,
    CovalentLoadingModule,
    CovalentExpansionPanelModule,
    CovalentDialogsModule,

    OAuthModule.forRoot()
  ],
  providers: [
    CourseService,
    RoomService,
    AppLoadService,
    {
      provide: APP_INITIALIZER,
      useFactory: get_login,
      deps: [AppLoadService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
