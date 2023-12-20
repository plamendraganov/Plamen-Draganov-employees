import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvGroupService {

  constructor() { }
  
  groupByProjectName(csvData: string[][]): { [key: string]: string[][] } {
    const groupedData: { [key: string]: string[][] } = {};

    for (let i = 0; i < csvData.length; i++) {
      const projectName = csvData[i][1]; 
      if (!groupedData[projectName]) {
        groupedData[projectName] = [];
      }
      groupedData[projectName].push(csvData[i].slice(0, 1).concat(csvData[i].slice(2))); 
    }

    return groupedData;
  }
}
