import {OMIDatasource} from './datasource';
import {OMIDatasourceQueryCtrl} from './query_ctrl';

class OMIConfigCtrl {}
OMIConfigCtrl.templateUrl = 'partials/config.html';

class OMIQueryOptionsCtrl {}
OMIQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

class OMIAnnotationsQueryCtrl {}
OMIAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html'

export {
  OMIDatasource as Datasource,
  OMIDatasourceQueryCtrl as QueryCtrl,
  OMIConfigCtrl as ConfigCtrl,
  OMIQueryOptionsCtrl as QueryOptionsCtrl,
  OMIAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
