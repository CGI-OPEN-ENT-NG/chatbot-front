import { DestroyObservable } from '@core/utils/destroy-observable';
import { Component, HostListener, OnInit } from '@angular/core';
import { StatsService } from '@core/services/stats.service';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-stats-best-questions',
  templateUrl: './stats-best-questions.component.html',
  styleUrls: ['./stats-best-questions.component.scss']
})
export class StatsBestQuestionsComponent extends DestroyObservable implements OnInit {

  chartData: any[];
  dataUrl: string;

  constructor(private _statsService: StatsService) {
    super();
  }

  ngOnInit(): void {
    this._statsService._currentFilters$
      .pipe(
        takeUntil(this.destroy$))
      .subscribe(() => {
          this.getGraph();
        }
      );
  }

  getGraph() {
    this._statsService.getBestQuestionsData().subscribe(
      (value) => {
        this.chartData = value['mostAskedQuestions'].map(elem => {
          return {
            value: [parseInt(elem['count'], 10)],
            name: elem['question']
          };
        });
        setTimeout(() => {
          this._setGraphMargin();
        });
      }
    );
  }

  downloadCanvasBest(event) {
    const anchor = event.target;
    const name = 'bestQuestionsChart-' + moment(new Date()).format('DDMMYYYYHHmmss') + '.jpg';

    // get the canvas
    anchor.href = this.dataUrl;
    anchor.download = name;
  }

  async download() {
    // Get the chart
    const node = document.getElementsByClassName('ngx-charts-outer')[1];
    this.dataUrl = await domtoimage.toPng(node);

    const btn: HTMLElement = document.getElementById('downloadBestQuestBtn');
    btn.click();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this._setGraphMargin();
  }

  private _setGraphMargin() {
    const legendNode = document.querySelectorAll('.stats-best-questions .chart-legend')[0];
    const graphNode = <HTMLElement> document.querySelectorAll('.stats-best-questions .chart-container')[0];
    if (!graphNode) {
      return;
    }
    graphNode.style.marginBottom = legendNode.clientHeight + 'px';
  }
}

