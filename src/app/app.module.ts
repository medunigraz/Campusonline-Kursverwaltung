import {HeaderComponent } from './header/header.component';
import {CourseListComponent } from './courseList/courseList.component';

import {APP_ROUTES} from './app.routes';
import {RouterModule} from '@angular/router';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER  } from '@angular/core';

import { OAuthModule } from 'angular-oauth2-oidc';

import { CourseService } from './services/course.service';
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

import {MatButtonModule} from '@angular/material';
import {MatMenuModule} from '@angular/material/menu'
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';

import { AppComponent } from './app.component';

export function get_login(appLoadService: AppLoadService) {
    console.log('APP_INITIALIZER STARTING');
    return () => appLoadService.getLogin();
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CourseListComponent
  ],
  imports: [
    RouterModule.forRoot(APP_ROUTES),

    BrowserModule,
    BrowserAnimationsModule,

    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatIconModule,


    CovalentLayoutModule,
    CovalentStepsModule,
    // (optional) Additional Covalent Modules imports
    CovalentHttpModule.forRoot(),
    CovalentHighlightModule,
    CovalentMarkdownModule,
    CovalentDynamicFormsModule,
    CovalentMessageModule,
    
    OAuthModule.forRoot()
  ],
  providers: [
    CourseService,
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
