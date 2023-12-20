import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CsvService } from './services/csv.service';
import { CsvGroupService } from './services/csv-group.service';
import { Employee } from './interfaces/Employee';
import { OverlapsData } from './interfaces/OverlapsData';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})

export class AppComponent {
  title = 'Plamen-Draganov-employees';
  csvData: string[][] = [];
  groupedData: { [key: string]: string[][] } = {};
  pairs: string[][] = [];
  mostDays: number = 0;
  calculatedOverlaps: { [key: string]: { pairs: string[][], mostDays: number } } = {};
  overlapsArray: OverlapsData[] = [];

  constructor(private _csvService: CsvService,  private csvGroupService: CsvGroupService) {
    
  }
  
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.readFile(file).then(content => {
        this.csvData = this.parseCsvData(content);
        this.csvData = this._csvService.normalizeDateFormats(this.csvData);
        this.groupedData = this.csvGroupService.groupByProjectName(this.csvData);
        this.calculateOverlapsForAllProjects();
        this.prepareOverlapsArray();
      });
    }
  }


  readFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onload = (e: any) => {
        const csvData: string = e.target.result;
        resolve(csvData);
      };

      reader.onerror = (e) => {
        reject(e);
      };

      reader.readAsText(file);
    });
  }

  parseCsvData(csvContent: string): string[][] {
    const rows: string[] = csvContent.split('\n');
    const data: string[][] = [];
    
    rows.forEach(row => {
      const cells: string[] = row.split(',');
      data.push(cells);
    });

    return data;
  }

  getProjectNames(): string[] {
    return Object.keys(this.groupedData);
  }

  calculateOverlapsForAllProjects(): void {
    for (const projectName in this.groupedData) {
      if (Object.prototype.hasOwnProperty.call(this.groupedData, projectName)) {
        this.calculateOverlapForProject(projectName.trim(), this.groupedData[projectName]);
      }
    }
  }

  calculateOverlapForProject(projectName: string, employeesData: string[][]): void {
    const employeesForProject = employeesData.map(employeeData => {
      const [name, startDateStr, endDateStr] = employeeData;
      return {
        name,
        startDate: new Date(startDateStr.trim()),
        endDate: new Date(endDateStr.trim())
      };
    });

    const overlaps = this.calculateOverlapLogic(employeesForProject);
    this.calculatedOverlaps[projectName] = overlaps;
  }

  calculateOverlapLogic(employees: Employee[]): { pairs: string[][], mostDays: number } {
    const pairs: string[][] = [];
    let mostDays = 0;

    for (let i = 0; i < employees.length; i++) {
      for (let j = i + 1; j < employees.length; j++) {
        const overlapStart = new Date(Math.max(employees[i].startDate.getTime(), employees[j].startDate.getTime()));
        const overlapEnd = new Date(Math.min(employees[i].endDate.getTime(), employees[j].endDate.getTime()));

        if (overlapStart < overlapEnd) {
          const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));

          if (overlapDays > mostDays) {
            mostDays = overlapDays;
          }

          pairs.push([employees[i].name, employees[j].name, overlapDays.toString()]);
        }
      }
    }

    pairs.sort((a, b) => {
      const daysA = parseInt(a[2]);
      const daysB = parseInt(b[2]);
      return daysB - daysA;
    });

    return { pairs, mostDays };
  }

  prepareOverlapsArray(): void {
    this.overlapsArray = Object.keys(this.calculatedOverlaps).map(projectName => {
      return {
        projectName,
        overlaps: this.calculatedOverlaps[projectName]
      };
    });
  }
}
