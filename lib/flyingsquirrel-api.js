/*
 * FlyingSquirrel server API interface.
 *
 * This is a toy for demo and simple projects. It only works from new
 * browsers: Firefox 3.5 and Chrome. Should not be used in production.
 */
var flyingsquirrel;
if (this.flyingsquirrel === undefined) {
    flyingsquirrel = this.flyingsquirrel = {};
}

if (!'JSON' in this) {
    if ('console' in window) {console.error('JSON is missing');}
}

if (!'jQuery' in this) {
    /* Sorry for that - we're using "$.ajax". */
    if ('console' in window) {console.error('jQuery is missing');}
}


(function() {
     var json_request = function (method, url, data, callback, filter) {
         var uri = parseUri(url);
         var async = callback ? true : false;
         var result = null;
         var wrapper = function (success, data, xhr) {
             var status = xhr.status;
             if (success === 'ok' && filter !== undefined) {
                 data = filter(data);
             }
             if (!data || data.length == 0) {
                 data = status;
             }
             if (async) {
                 callback(success, data, status);
             } else {
                 result = [success, data, status];
             }
         };
         var clean_url = uri.protocol+'://' +
             uri.host+(uri.port?':'+uri.port:'') + uri.relative;
         // console.log(clean_url + " " + uri.user + " " + uri.password);
         /* Apparently, ajax username+password don't work in
          * firefox. Here's what we tried:
          *    username: uri.user,
          *    password: uri.password,
          *    xhrFields: {withCredentials: "true"},
          * Instead, let's construct the Authorization header manually.
          */
         $.ajax(clean_url,
                {type: method,
                 data: JSON.stringify(data),
                 dataType: 'json',
                 contentType: 'application/json',
                 async: async,
                 cache: false,
                 beforeSend : function(req) {
                     req.setRequestHeader('Authorization', "Basic " +
                                          btoa(uri.user + ':' + uri.password));
                 },
                 success: function(data, tstatus, xhr) {
                     wrapper('ok', data, xhr);
                 },
                 error: function(xhr, tstatus) {
                     wrapper('error', '', xhr);
                 }});
         if (!async) {
             var success = result[0], data = result[1], status = result[2];
             if (success !== 'ok') {
                 throw "Http status " + status + " for url: " + url;
             } else {
                 return data;
             }
         };
         return null;
     };

     var flyingsquirrel = this.flyingsquirrel;
     flyingsquirrel.json_request = json_request;

     flyingsquirrel.API = function (base_url) {
         this.base_url = base_url;
     };

     flyingsquirrel.API.prototype = {
         '_endpoint_url': function (endpoint_name) {
             return this.base_url + '/endpoints/' +
                 encodeURIComponent(endpoint_name);
         },
         'create_endpoint': function (endpoint_name, definition, callback) {
             var url = this._endpoint_url(endpoint_name);
             return json_request('PUT', url, {definition:definition}, callback);
         },
         'delete_endpoint': function (endpoint_name, callback) {
             var url = this._endpoint_url(endpoint_name);
             return json_request('DELETE', url, null, callback);
         },
         'generate_ticket': function (endpoint_name, identity, callback,
                                      timeout) {
             var url = this._endpoint_url(endpoint_name) + '/tickets';
             var req = {identity:identity};
             if (timeout !== undefined) {
                 req.timeout = timeout;
             }
             var filter = function(res) {
                 return res.ticket;
             };
             return json_request('POST', url, req, callback, filter);
         }
     };
 })();
