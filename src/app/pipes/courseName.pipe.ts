import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'couresName',
  pure: true
})
export class CourseNamePipe implements PipeTransform {
  transform(value: string, length: number): string {
  let output: string = "";
    if(value) {
      if(value.length <= length) {
        output = value;
      } else {
        output = value.substring(0, length) + "...";
      }
    } else {
      output = "";
    }
    return output;
  }
}
