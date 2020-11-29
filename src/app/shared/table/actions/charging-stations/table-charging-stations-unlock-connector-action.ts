import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { TableAction } from 'shared/table/actions/table-action';
import { ChargingStation, ChargingStationButtonAction, Connector } from 'types/ChargingStation';
import { ActionResponse } from 'types/DataResult';
import { ButtonColor, ButtonType, TableActionDef } from 'types/Table';
import { OCPPUnlockStatus } from 'types/ocpp/OCPP';
import { Utils } from 'utils/Utils';

export interface TableChargingStationsUnlockConnectorActionDef extends TableActionDef {
  action: (connector: Connector, chargingStation: ChargingStation,
    dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
    refresh?: () => Observable<void>) => void;
}

export class TableChargingStationsUnlockConnectorAction implements TableAction {
  private action: TableChargingStationsUnlockConnectorActionDef = {
    id: ChargingStationButtonAction.UNLOCK_CONNECTOR,
    type: 'button',
    icon: 'lock_open',
    color: ButtonColor.ACCENT,
    name: 'general.unlock',
    tooltip: 'general.tooltips.unlock',
    action: this.unlockConnector.bind(this),
  };

  public getActionDef(): TableChargingStationsUnlockConnectorActionDef {
    return this.action;
  }

  private unlockConnector(connector: Connector, chargingStation: ChargingStation,
    dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
    refresh?: () => Observable<void>) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('chargers.unlock_connector_title'),
      translateService.instant('chargers.unlock_connector_confirm', {
        chargeBoxID: chargingStation.id,
        connectorId: connector.connectorId,
      }),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        centralServerService.chargingStationsUnlockConnector(
          chargingStation.id, connector.connectorId).subscribe((unlockConnectorResponse: ActionResponse) => {
            spinnerService.hide();
            if (unlockConnectorResponse.status === OCPPUnlockStatus.UNLOCKED) {
              messageService.showSuccessMessage(
                translateService.instant('chargers.unlock_connector_success', {
                  chargeBoxID: chargingStation.id,
                  connectorId: connector.connectorId,
                }));
              if (refresh) {
                refresh().subscribe();
              }
            } else {
              Utils.handleError(JSON.stringify(response),
                messageService, translateService.instant('chargers.unlock_connector_error'));
            }
          }, (error) => {
            spinnerService.hide();
            Utils.handleHttpError(error, router, messageService, centralServerService, 'chargers.unlock_connector_error');
          });
      }
    });
  }
}
