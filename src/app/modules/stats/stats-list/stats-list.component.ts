import { Component, Inject, OnInit } from '@angular/core';

@Component({
    selector: 'app-stats-list',
    templateUrl: './stats-list.component.html',
    styleUrls: ['./stats-list.component.scss']
  })
export class StatsListComponent implements OnInit {

  statView = 'chatbot';

  constructor() {
    }

  ngOnInit(): void {
    }
}
