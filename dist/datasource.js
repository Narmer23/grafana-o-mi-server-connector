'use strict';

System.register(['lodash'], function (_export, _context) {
    "use strict";

    var _, _createClass, OMIDatasource;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_lodash) {
            _ = _lodash.default;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _export('OMIDatasource', OMIDatasource = function () {
                function OMIDatasource(instanceSettings, $q, backendSrv, templateSrv) {
                    _classCallCheck(this, OMIDatasource);

                    this.type = instanceSettings.type;
                    this.url = instanceSettings.url;
                    this.name = instanceSettings.name;
                    this.parser = new DOMParser();
                    this.q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.withCredentials = instanceSettings.withCredentials;
                    this.headers = { 'Content-Type': 'application/xml' };
                    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
                        this.headers['Authorization'] = instanceSettings.basicAuth;
                    }
                }

                _createClass(OMIDatasource, [{
                    key: 'query',
                    value: async function query(_query) {
                        if (_query.targets.length <= 0) {
                            return this.q.when({ data: [] });
                        }

                        var target = _query.targets[0];

                        var data = target.target;

                        if (!target.objectType || !target.columnStructure) {
                            return target.defaultData;
                        }

                        var resp = await this.doRequest({
                            url: this.url,
                            data: data,
                            method: 'POST'
                        });

                        var xmlDoc = this.parser.parseFromString(resp.data, "text/xml");
                        var omiJson = this.xmlToJson(xmlDoc);

                        omiJson = omiJson.omiEnvelope.response.result.msg.Objects;

                        var omiJsonArray = this.getOMIArrayByType(omiJson, target.objectType);

                        return this.mapArrayToTableColumns(omiJsonArray, JSON.parse(target.columnStructure));
                    }
                }, {
                    key: 'testDatasource',
                    value: function testDatasource() {
                        return this.doRequest({
                            url: this.url + '/',
                            method: 'GET'
                        }).then(function (response) {
                            if (response.status === 200) {
                                return { status: "success", message: "Data source is working", title: "Success" };
                            }
                        });
                    }
                }, {
                    key: 'annotationQuery',
                    value: function annotationQuery(options) {
                        return [];
                        var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
                        var annotationQuery = {
                            range: options.range,
                            annotation: {
                                name: options.annotation.name,
                                datasource: options.annotation.datasource,
                                enable: options.annotation.enable,
                                iconColor: options.annotation.iconColor,
                                query: query
                            },
                            rangeRaw: options.rangeRaw
                        };

                        return this.doRequest({
                            url: this.url + '/annotations',
                            method: 'POST',
                            data: annotationQuery
                        }).then(function (result) {
                            return result.data;
                        });
                    }
                }, {
                    key: 'xmlToJson',
                    value: function xmlToJson(xml) {
                        // Create the return object
                        var obj = {};
                        if (xml.nodeType == 1) {
                            // element
                            // do attributes
                            if (xml.attributes.length > 0) {
                                obj["_attributes"] = {};
                                for (var j = 0; j < xml.attributes.length; j++) {
                                    var attribute = xml.attributes.item(j);
                                    obj["_attributes"][attribute.nodeName] = attribute.nodeValue;
                                }
                            }
                        } else if (xml.nodeType == 3) {
                            // text
                            obj = xml.nodeValue;
                        }
                        // do children
                        if (xml.hasChildNodes()) {
                            for (var i = 0; i < xml.childNodes.length; i++) {
                                var item = xml.childNodes.item(i);
                                var nodeName = item.nodeName;
                                if (typeof obj[nodeName] == "undefined") {
                                    obj[nodeName] = this.xmlToJson(item);
                                } else {
                                    if (typeof obj[nodeName].push == "undefined") {
                                        var old = obj[nodeName];
                                        obj[nodeName] = [];
                                        obj[nodeName].push(old);
                                    }
                                    obj[nodeName].push(this.xmlToJson(item));
                                }
                            }
                        }
                        return obj;
                    }
                }, {
                    key: 'getOMIArrayByType',
                    value: function getOMIArrayByType(omiJson, type) {
                        var _this = this;

                        if (!omiJson) return [];
                        if (omiJson.constructor === Array) {
                            var array = [];
                            omiJson.forEach(function (el) {
                                return array = array.concat(_this.getOMIArrayByType(el, type));
                            });
                            return array;
                        }
                        if (omiJson._attributes && omiJson._attributes.type && omiJson._attributes.type.indexOf(type) >= 0) {
                            return [omiJson];
                        }
                        if (!omiJson.Object) return [];

                        return this.getOMIArrayByType(omiJson.Object, type);
                    }
                }, {
                    key: 'mapArrayToTableColumns',
                    value: function mapArrayToTableColumns(omiObjectsArray, columnStructure) {

                        var rows = [];

                        omiObjectsArray.forEach(function (item) {
                            var itemValues = [];
                            columnStructure.forEach(function (col) {
                                itemValues.push(_.get(item, col.path));
                            });
                            rows.push(itemValues);
                        });

                        return {
                            data: [{
                                type: "table",
                                columns: columnStructure,
                                rows: rows
                            }]
                        };
                    }
                }, {
                    key: 'doRequest',
                    value: function doRequest(options) {
                        options.withCredentials = this.withCredentials;
                        options.headers = this.headers;

                        return this.backendSrv.datasourceRequest(options);
                    }
                }, {
                    key: 'buildQueryParameters',
                    value: function buildQueryParameters(options) {
                        var _this2 = this;

                        //remove placeholder targets
                        options.targets = _.filter(options.targets, function (target) {
                            return target.target !== 'select metric';
                        });

                        var targets = _.map(options.targets, function (target) {
                            return {
                                target: _this2.templateSrv.replace(target.target, options.scopedVars, 'regex'),
                                refId: target.refId,
                                hide: target.hide,
                                type: target.type || 'timeserie'
                            };
                        });

                        options.targets = targets;

                        return options;
                    }
                }, {
                    key: 'getTagKeys',
                    value: function getTagKeys(options) {
                        var _this3 = this;

                        return new Promise(function (resolve, reject) {
                            _this3.doRequest({
                                url: _this3.url + '/tag-keys',
                                method: 'POST',
                                data: options
                            }).then(function (result) {
                                return resolve(result.data);
                            });
                        });
                    }
                }, {
                    key: 'getTagValues',
                    value: function getTagValues(options) {
                        var _this4 = this;

                        return new Promise(function (resolve, reject) {
                            _this4.doRequest({
                                url: _this4.url + '/tag-values',
                                method: 'POST',
                                data: options
                            }).then(function (result) {
                                return resolve(result.data);
                            });
                        });
                    }
                }]);

                return OMIDatasource;
            }());

            _export('OMIDatasource', OMIDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map
