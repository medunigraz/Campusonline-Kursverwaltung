import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private _iconRegistry: MatIconRegistry,
            private _domSanitizer: DomSanitizer) {
    this._iconRegistry.addSvgIconInNamespace('assets', 'sun',
    this._domSanitizer.bypassSecurityTrustResourceUrl('assets/images/meduni_rundlogo.svg'));

  }

  ngOnInit() {
    console.log("test");
  }
}
