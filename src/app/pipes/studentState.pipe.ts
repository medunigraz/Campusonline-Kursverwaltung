import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'StudentState',
  pure: true
})
export class StudentStatePipe implements PipeTransform {
  transform(value: string): string {
    let output: string = "";
    if(value === 'assigned') {
      output = "Anwesend"
    } else if(value === 'canceled') {
      output = "Aus LV entfernt"
    } else if(value === 'left') {
      output = "LV verlassen"
    } else {
        output = value
    }

    return output;
  }
}
