import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'header',
  templateUrl: './header.component.html'
})
export class HeaderComponent  {

  constructor(private _iconRegistry: MatIconRegistry,
            private _domSanitizer: DomSanitizer) {
    this._iconRegistry.addSvgIconInNamespace('assets', 'sun',
    this._domSanitizer.bypassSecurityTrustResourceUrl('assets/images/meduni_rundlogo.svg'));

  }
}
