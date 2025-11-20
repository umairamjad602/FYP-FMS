import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calculateEndDate'
})
export class CalculateEndDatePipe implements PipeTransform {
  transform(startDate: string, duration: number): Date {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + duration);
    return date;
  }
}