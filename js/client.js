/*
 * UUID-js: A js library to generate and parse UUIDs, TimeUUIDs and generate
 * TimeUUID based on dates for range selections.
 * @see http://www.ietf.org/rfc/rfc4122.txt
 **/

function UUIDjs() {
};

UUIDjs.maxFromBits = function(bits) {
    return Math.pow(2, bits);
};

UUIDjs.limitUI04 = UUIDjs.maxFromBits(4);
UUIDjs.limitUI06 = UUIDjs.maxFromBits(6);
UUIDjs.limitUI08 = UUIDjs.maxFromBits(8);
UUIDjs.limitUI12 = UUIDjs.maxFromBits(12);
UUIDjs.limitUI14 = UUIDjs.maxFromBits(14);
UUIDjs.limitUI16 = UUIDjs.maxFromBits(16);
UUIDjs.limitUI32 = UUIDjs.maxFromBits(32);
UUIDjs.limitUI40 = UUIDjs.maxFromBits(40);
UUIDjs.limitUI48 = UUIDjs.maxFromBits(48);

// Returns a random integer between min and max
// Using Math.round() will give you a non-uniform distribution!
// @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

UUIDjs.randomUI04 = function() {
    return getRandomInt(0, UUIDjs.limitUI04-1);
};
UUIDjs.randomUI06 = function() {
    return getRandomInt(0, UUIDjs.limitUI06-1);
};
UUIDjs.randomUI08 = function() {
    return getRandomInt(0, UUIDjs.limitUI08-1);
};
UUIDjs.randomUI12 = function() {
    return getRandomInt(0, UUIDjs.limitUI12-1);
};
UUIDjs.randomUI14 = function() {
    return getRandomInt(0, UUIDjs.limitUI14-1);
};
UUIDjs.randomUI16 = function() {
    return getRandomInt(0, UUIDjs.limitUI16-1);
};
UUIDjs.randomUI32 = function() {
    return getRandomInt(0, UUIDjs.limitUI32-1);
};
UUIDjs.randomUI40 = function() {
    return (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << 40 - 30)) * (1 << 30);
};
UUIDjs.randomUI48 = function() {
    return (0 | Math.random() * (1 << 30)) + (0 | Math.random() * (1 << 48 - 30)) * (1 << 30);
};

UUIDjs.paddedString = function(string, length, z) {
    string = String(string);
    z = (!z) ? '0' : z;
    var i = length - string.length;
    for (; i > 0; i >>>= 1, z += z) {
        if (i & 1) {
            string = z + string;
        }
    }
    return string;
};

UUIDjs.prototype.fromParts = function(timeLow, timeMid, timeHiAndVersion, clockSeqHiAndReserved, clockSeqLow, node) {
    this.version = (timeHiAndVersion >> 12) & 0xF;
    this.hex = UUIDjs.paddedString(timeLow.toString(16), 8)
        + '-'
        + UUIDjs.paddedString(timeMid.toString(16), 4)
        + '-'
        + UUIDjs.paddedString(timeHiAndVersion.toString(16), 4)
        + '-'
        + UUIDjs.paddedString(clockSeqHiAndReserved.toString(16), 2)
        + UUIDjs.paddedString(clockSeqLow.toString(16), 2)
        + '-'
        + UUIDjs.paddedString(node.toString(16), 12);
    return this;
};

UUIDjs.prototype.toString = function() {
    return this.hex;
};
UUIDjs.prototype.toURN = function() {
    return 'urn:uuid:' + this.hex;
};

UUIDjs.prototype.toBytes = function() {
    var parts = this.hex.split('-');
    var ints = [];
    var intPos = 0;
    for (var i = 0; i < parts.length; i++) {
        for (var j = 0; j < parts[i].length; j+=2) {
            ints[intPos++] = parseInt(parts[i].substr(j, 2), 16);
        }
    }
    return ints;
};

UUIDjs.prototype.equals = function(uuid) {
    if (!(uuid instanceof UUID)) {
        return false;
    }
    if (this.hex !== uuid.hex) {
        return false;
    }
    return true;
};

UUIDjs.getTimeFieldValues = function(time) {
    var ts = time - Date.UTC(1582, 9, 15);
    var hm = ((ts / 0x100000000) * 10000) & 0xFFFFFFF;
    return { low: ((ts & 0xFFFFFFF) * 10000) % 0x100000000,
        mid: hm & 0xFFFF, hi: hm >>> 16, timestamp: ts };
};

UUIDjs._create4 = function() {
    return new UUIDjs().fromParts(
        UUIDjs.randomUI32(),
        UUIDjs.randomUI16(),
        0x4000 | UUIDjs.randomUI12(),
        0x80   | UUIDjs.randomUI06(),
        UUIDjs.randomUI08(),
        UUIDjs.randomUI48()
    );
};

UUIDjs._create1 = function() {
    var now = new Date().getTime();
    var sequence = UUIDjs.randomUI14();
    var node = (UUIDjs.randomUI08() | 1) * 0x10000000000 + UUIDjs.randomUI40();
    var tick = UUIDjs.randomUI04();
    var timestamp = 0;
    var timestampRatio = 1/4;

    if (now != timestamp) {
        if (now < timestamp) {
            sequence++;
        }
        timestamp = now;
        tick = UUIDjs.randomUI04();
    } else if (Math.random() < timestampRatio && tick < 9984) {
        tick += 1 + UUIDjs.randomUI04();
    } else {
        sequence++;
    }

    var tf = UUIDjs.getTimeFieldValues(timestamp);
    var tl = tf.low + tick;
    var thav = (tf.hi & 0xFFF) | 0x1000;

    sequence &= 0x3FFF;
    var cshar = (sequence >>> 8) | 0x80;
    var csl = sequence & 0xFF;

    return new UUIDjs().fromParts(tl, tf.mid, thav, cshar, csl, node);
};

UUIDjs.create = function(version) {
    version = version || 4;
    return this['_create' + version]();
};

UUIDjs.fromTime = function(time, last) {
    last = (!last) ? false : last;
    var tf = UUIDjs.getTimeFieldValues(time);
    var tl = tf.low;
    var thav = (tf.hi & 0xFFF) | 0x1000;  // set version '0001'
    if (last === false) {
        return new UUIDjs().fromParts(tl, tf.mid, thav, 0, 0, 0);
    } else {
        return new UUIDjs().fromParts(tl, tf.mid, thav, 0x80 | UUIDjs.limitUI06, UUIDjs.limitUI08 - 1, UUIDjs.limitUI48 - 1);
    }
};

UUIDjs.firstFromTime = function(time) {
    return UUIDjs.fromTime(time, false);
};
UUIDjs.lastFromTime = function(time) {
    return UUIDjs.fromTime(time, true);
};

UUIDjs.fromURN = function(strId) {
    var r, p = /^(?:urn:uuid:|\{)?([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{2})([0-9a-f]{2})-([0-9a-f]{12})(?:\})?$/i;
    if ((r = p.exec(strId))) {
        return new UUIDjs().fromParts(parseInt(r[1], 16), parseInt(r[2], 16),
            parseInt(r[3], 16), parseInt(r[4], 16),
            parseInt(r[5], 16), parseInt(r[6], 16));
    }
    return null;
};

UUIDjs.fromBytes = function(ints) {
    if (ints.length < 5) {
        return null;
    }
    var str = '';
    var pos = 0;
    var parts = [4, 2, 2, 2, 6];
    for (var i = 0; i < parts.length; i++) {
        for (var j = 0; j < parts[i]; j++) {
            var octet = ints[pos++].toString(16);
            if (octet.length == 1) {
                octet = '0' + octet;
            }
            str += octet;
        }
        if (parts[i] !== 6) {
            str += '-';
        }
    }
    return UUIDjs.fromURN(str);
};

UUIDjs.fromBinary = function(binary) {
    var ints = [];
    for (var i = 0; i < binary.length; i++) {
        ints[i] = binary.charCodeAt(i);
        if (ints[i] > 255 || ints[i] < 0) {
            throw new Error('Unexpected byte in binary data.');
        }
    }
    return UUIDjs.fromBytes(ints);
};

// Aliases to support legacy code. Do not use these when writing new code as
// they may be removed in future versions!
UUIDjs['new'] = function() {
    return this.create(4);
};
UUIDjs.newTS = function() {
    return this.create(1);
};

window.p5api = (function($, UUID) {
    var p5apiConfig = {
        formSelector: ".registrationForm",
        eventName: null,
        bindOnSubmit: true,
        serverUrl: "http://193.124.184.171:8081/endpoint",
        uploadPhoto: false
    };

    function collectFields() {
        var fields = {};
        var file = null;
        try {
            $(p5apiConfig.formSelector + " input, " + p5apiConfig.formSelector + " textarea, " + p5apiConfig.formSelector + " select").each(
                function (idx, item) {
                    item = $(item);

                    var fieldValue;
                    var fieldValueType;

                    var itemValue = item.val();
                    switch (item.attr("platform5-type")) {
                        case "file":
                            file = itemValue;
                            break;
                        case "text":
                            fieldValueType = "Value.Str";
                            fieldValue = itemValue;
                            break;
                        case "hidden":
                            fieldValueType = "Value.Str";
                            fieldValue = itemValue;
                            break;
                        case "hidden-refs":
                            fieldValueType = "Value.ObjectRefs";
                            fieldValue = [itemValue];
                            break;
                        case "objectRefs":
                            fieldValueType = "Value.ObjectRefs";
                            fieldValue = [itemValue.substring(itemValue.indexOf(":") + 1)];
                            break;
                        case "objectRef":
                            fieldValueType = "Value.ObjectRefs";
                            fieldValue = [itemValue.substring(itemValue.indexOf(":") + 1)];
                            break;
                        case "boolean":
                            fieldValueType = "Value.Bool";
                            fieldValue = itemValue;
                            break;
                        default:
                            console.log(item.attr("platform5-type"), itemValue)
                    }

                    if (!fieldValueType) return;

                    if (!fieldValue) fieldValueType = "Value.Empty";

                    fields[item.attr("name")] = {
                        value: fieldValue,
                        type: fieldValueType
                    };
                }
            );
        } catch(err) {
            console.log(err);
            redirectFailure();
        }


        return {fields: fields, file: file};
    }

    function sendData(success, failure) {
        var collected = collectFields();
        
        return $.ajax({
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            url: p5apiConfig.serverUrl,
            data: JSON.stringify(createRequest("Form.Data", "Register", {
                formName: p5apiConfig.eventName,
                fields: collected.fields
            })),
            success: function(json) {
                console.log(JSON.stringify(json));
                if (collected.file == "") {
                    redirectFailure();
                } else {
                    if(success){
                        success(json);
                    }
                }
            },
            error: function(json) {
                if(failure){
                    failure(json);
                }
            }
        })
    }

    function redirectSuccess() {
        window.location.pathname = getLanguageZone(window.location.pathname) + "/success.html";
    }

    function redirectFailure() {
        window.location.pathname = getLanguageZone(window.location.pathname) + "/failure.html";
    }

    function getLanguageZone(pathName) {
        var parts = pathName.replace(/\/\s*$/,'').split('/');
        return parts[1]
    }

    function createRequest(serverName, methodName, data) {
        return {
            id: UUID.create().hex,
            service: serverName,
            method: methodName,
            data: JSON.stringify(data)
        }
    }

    function initSelector(formName, fieldName, item) {
        $.ajax({
            url: p5apiConfig.serverUrl,
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(createRequest("Form.Fields", "Values", {
                formName: p5apiConfig.eventName,
                fieldName: fieldName
            })),
            success: function(json) {
                var records = json.data.details.result.map(function(record) { return record.data });
                item.empty();
                item.append($("<option>", {
                    value: "",
                    text: "-- Выбор значения --"
                }));
                records.forEach(function(record) {
                    item.append($("<option>", {
                        value: record.id,
                        text: record.value
                    }))
                })
            }
        })
    }

    function initSelectors() {
        var selectors = $(p5apiConfig.formSelector + " select");
        selectors.each(function(idx, element) {
            var itemElement = $(element);
            if( itemElement.is("[platform5-bind]") ){
                initSelector(p5apiConfig.eventName, itemElement.attr("name"), itemElement);
            }
        });
    }

    var initialized = false;
    function doInit() {
        initSelectors();

        //if (p5apiConfig.bindOnSubmit) {
        //    $(p5apiConfig.formSelector).submit(function () {
        //        console.log("Submit");
        //        try {
        //            sendData();
        //        } catch (e) {
        //            console.error("Failure", e);
        //        }
        //        return false;
        //    });
        //}

        initialized = true;
    }

    return {
        config: function(eventName, serverUrl, bindOnSubmit, formSelector) {
            return {
                bindOnSubmit: bindOnSubmit,
                eventName: eventName,
                serverUrl: serverUrl,
                formSelector: formSelector
            }
        },
        sendRequest: function(success, failure) {
            sendData(success, failure);
        },
        signin: function(login, password) {
            return signinRequest(login, password)
        },
        loadFormData: function(token) {
            return loadFormData(token)
        },
        loadFormFields: function(token) {
            return loadFormFields(token)
        },
        init: function(config) {
            if ( initialized ) return;

            p5apiConfig.bindOnSubmit = config.bindOnSubmit || p5apiConfig.bindOnSubmit;
            p5apiConfig.eventName = config.eventName || p5apiConfig.eventName;
            p5apiConfig.formSelector = config.formSelector || p5apiConfig.formSelector;
            p5apiConfig.serverUrl = config.serverUrl || p5apiConfig.serverUrl;

            if ( !p5apiConfig.eventName ) {
                alert("Необходимо задать значение 'eventName'!")
                return;
            }

            $(window).ready(doInit);
        }
    }
})(jQuery, UUIDjs);