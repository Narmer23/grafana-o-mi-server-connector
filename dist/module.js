'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  "use strict";

  var OMIDatasource, OMIDatasourceQueryCtrl, OMIConfigCtrl, OMIQueryOptionsCtrl, OMIAnnotationsQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      OMIDatasource = _datasource.OMIDatasource;
    }, function (_query_ctrl) {
      OMIDatasourceQueryCtrl = _query_ctrl.OMIDatasourceQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', OMIConfigCtrl = function OMIConfigCtrl() {
        _classCallCheck(this, OMIConfigCtrl);
      });

      OMIConfigCtrl.templateUrl = 'partials/config.html';

      _export('QueryOptionsCtrl', OMIQueryOptionsCtrl = function OMIQueryOptionsCtrl() {
        _classCallCheck(this, OMIQueryOptionsCtrl);
      });

      OMIQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

      _export('AnnotationsQueryCtrl', OMIAnnotationsQueryCtrl = function OMIAnnotationsQueryCtrl() {
        _classCallCheck(this, OMIAnnotationsQueryCtrl);
      });

      OMIAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

      _export('Datasource', OMIDatasource);

      _export('QueryCtrl', OMIDatasourceQueryCtrl);

      _export('ConfigCtrl', OMIConfigCtrl);

      _export('QueryOptionsCtrl', OMIQueryOptionsCtrl);

      _export('AnnotationsQueryCtrl', OMIAnnotationsQueryCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
