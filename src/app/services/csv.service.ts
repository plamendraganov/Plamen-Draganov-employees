import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

  normalizeDateFormats(csvData: string[][]): string[][] {
    const headerRow = csvData[0];

    // Find date columns
    const dateColumns: number[] = [];
    for (let i = 0; i < headerRow.length; i++) {
      if (this.isDate(headerRow[i])) {
        dateColumns.push(i);
      }
    }

    // Normalize date formats in the date columns
    for (let i = 1; i < csvData.length; i++) {
      for (const col of dateColumns) {
        csvData[i][col] = this.normalizeDateFormat(csvData[i][col]);
      }
    }

    return csvData;
  }

  private isDate(value: string): boolean {
    return !isNaN(Date.parse(value));
  }

  private normalizeDateFormat(dateString: string): string {
    if (!dateString || dateString.trim().toUpperCase() === 'NULL') {
      const currentDate = new Date();
      return this.formatDate(currentDate);
    }
  
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return this.formatDate(date);
    } else {
     
      const regexShortDate = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
      const regexLongDate = /^[a-zA-Z]{3}\s\d{1,2}\s\d{2,4}$/;
      const regexFullDate = /^\w{3}\s\w{3}\s\d{1,2}\s\d{2,4}/;
      const regexMonthYear = /^[a-zA-Z]{3}\s\d{4}$/;
      const regexMonthDayYear = /^[a-zA-Z]{3}\s\d{1,2}\s\d{4}$/;
  
      if (dateString.match(regexShortDate)) {
        const [month, day, year] = dateString.split('/');
        return `${year}-${this.formatMonth(+month)}-${this.formatDay(+day)}`;
      } else if (dateString.match(regexLongDate)) {
        const [month, day, year] = dateString.split(' ');
        return `${year}-${this.formatMonthName(month)}-${this.formatDay(+day)}`;
      } else if (dateString.match(regexFullDate)) {
        return date.toISOString().slice(0, 10);
      } else if (dateString.match(regexMonthYear)) {
        const [month, year] = dateString.split(' ');
        return `${year}-${this.formatMonthName(month)}-01`;
      } else if (dateString.match(regexMonthDayYear)) {
        const [month, day, year] = dateString.split(' ');
        return `${year}-${this.formatMonthName(month)}-${this.formatDay(+day)}`;
      } else {
        return dateString; 
      }
    }
  }
  
  
  private formatMonth(month: number): string {
    return (`0${month}`).slice(-2);
  }
  
  private formatDay(day: number): string {
    return (`0${day}`).slice(-2);
  }
  
  private formatMonthName(monthName: string): string {
    return new Date(Date.parse(`${monthName} 1, 2000`)).toLocaleString('en-us', { month: 'short' });
  }
  
  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
  
  
}
