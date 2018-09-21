import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class OMIDatasourceQueryCtrl extends QueryCtrl {

    constructor($scope, $injector) {
        super($scope, $injector);

        this.scope = $scope;
        this.target.target = this.target.target || 'select metric';
        this.target.type = 'table';
        this.target.defaultData = {
            data: [
                {
                    type: 'table',
                    columns: [
                        {
                            text: 'Missing query values',
                            type: 'text'
                        }
                    ],
                    rows: [
                        ['Some of the values for the query are not complete']
                    ]
                }
            ]
        };
    }

    toggleEditorMode() {
        this.target.rawQuery = !this.target.rawQuery;
    }

    onChangeInternal() {
        this.panelCtrl.refresh(); // Asks the panel to refresh data.
    }
}

OMIDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

