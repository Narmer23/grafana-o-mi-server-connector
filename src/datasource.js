import _ from "lodash";

export class OMIDatasource {

    constructor(instanceSettings, $q, backendSrv, templateSrv) {
        this.type = instanceSettings.type;
        this.url = instanceSettings.url;
        this.name = instanceSettings.name;
        this.parser = new DOMParser();
        this.q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        this.withCredentials = instanceSettings.withCredentials;
        this.headers = {'Content-Type': 'application/xml'};
        if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
            this.headers['Authorization'] = instanceSettings.basicAuth;
        }
    }

    async query(query) {
        if (query.targets.length <= 0) {
            return this.q.when({data: []});
        }

        let target = query.targets[0];


        let data = target.target;

        if (!target.objectType || !target.columnStructure) {
            return target.defaultData;
        }


        let resp = await this.doRequest({
            url: this.url,
            data: data,
            method: 'POST'
        });

        let xmlDoc = this.parser.parseFromString(resp.data, "text/xml");
        let omiJson = this.xmlToJson(xmlDoc);

        omiJson = omiJson.omiEnvelope.response.result.msg.Objects;

        let omiJsonArray = this.getOMIArrayByType(omiJson, target.objectType);

        return this.mapArrayToTableColumns(omiJsonArray, JSON.parse(target.columnStructure));
    }

    testDatasource() {
        return this.doRequest({
            url: this.url + '/',
            method: 'GET',
        }).then(response => {
            if (response.status === 200) {
                return {status: "success", message: "Data source is working", title: "Success"};
            }
        });
    }

    annotationQuery(options) {
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
        }).then(result => {
            return result.data;
        });
    }

    xmlToJson(xml) {
        // Create the return object
        var obj = {};
        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["_attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["_attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) == "undefined") {
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

    getOMIArrayByType(omiJson, type) {

        if (!omiJson)
            return [];
        if (omiJson.constructor === Array) {
            let array = [];
            omiJson.forEach(el => array = array.concat(this.getOMIArrayByType(el, type)));
            return array;
        }
        if (omiJson._attributes && omiJson._attributes.type && omiJson._attributes.type.indexOf(type) >= 0) {
            return [omiJson];
        }
        if (!omiJson.Object)
            return [];

        return this.getOMIArrayByType(omiJson.Object, type)
    }

    mapArrayToTableColumns(omiObjectsArray, columnStructure) {

        let rows = [];

        omiObjectsArray.forEach(item => {
            let itemValues = [];
            columnStructure.forEach(col => {
                itemValues.push(_.get(item, col.path))
            });
            rows.push(itemValues)
        });

        return {
            data: [
                {
                    type: "table",
                    columns: columnStructure,
                    rows: rows
                }
            ]
        };
    }

    doRequest(options) {
        options.withCredentials = this.withCredentials;
        options.headers = this.headers;

        return this.backendSrv.datasourceRequest(options);
    }

    buildQueryParameters(options) {
        //remove placeholder targets
        options.targets = _.filter(options.targets, target => {
            return target.target !== 'select metric';
        });

        var targets = _.map(options.targets, target => {
            return {
                target: this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'timeserie'
            };
        });

        options.targets = targets;

        return options;
    }

    getTagKeys(options) {
        return new Promise((resolve, reject) => {
            this.doRequest({
                url: this.url + '/tag-keys',
                method: 'POST',
                data: options
            }).then(result => {
                return resolve(result.data);
            });
        });
    }

    getTagValues(options) {
        return new Promise((resolve, reject) => {
            this.doRequest({
                url: this.url + '/tag-values',
                method: 'POST',
                data: options
            }).then(result => {
                return resolve(result.data);
            });
        });
    }

}
