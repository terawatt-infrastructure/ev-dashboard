import { Component, Input } from '@angular/core';
import { Connector } from 'app/types/ChargingStation';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <span>
      <ng-container>
        <span class="ml-1" [ngClass]="row.inactivityStatus | appColorByStatus">
          {{row.totalInactivitySecs | appInactivity}}
        </span>
      </ng-container>
    </span>
  `,
})
export class ChargingStationsConnectorInactivityCellComponent extends CellContentTemplateComponent {
  @Input() public row!: Connector;
}
