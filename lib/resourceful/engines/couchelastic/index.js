
var Couchdb = require('./couchdb').Couchdb,
	Elasticsearch = require('./elasticsearch').Elasticsearch;

var Couchelastic = exports.Couchelastic = function Couchelastic(config) {
	
	Couchdb.apply(this,arguments);
	
	//this.couchConnection = this.couch.connection;
	//this.prototype = couch;
};

Couchelastic.prototype.constructor = Couchdb;

Couchelastic.prototype.protocol = 'couchelastic';

Couchelastic.prototype.search = Elasticsearch.prototype.search;

Couchelastic.prototype.sync = function ( factory, callback ) {
  var that = this,
      id = '_design/' + factory.resource;

  factory._design = factory._design || {};
  factory._design._id = id;
  if (factory._design._rev) return callback(null);

  this.connection.head(id, function (e, headers, status) {
    if (!e && headers.etag) {
      factory._design._rev = headers.etag.slice(1, -1);
    }
    
    that.connection.put(id, factory._design, function (e, res) {
      if (e) {
        if (e.reason === 'no_db_file') {
          that.connection.connection.create(function () {
            that.sync(callback);
          });
        } 
        else {

          /* TODO: Catch errors here. Needs a rewrite, because of the race */
          /* condition, when the design doc is trying to be written in parallel */
          callback(e);
        }
      }
      else {
        // We might not need to wait for the document to be
        // persisted, before returning it. If for whatever reason
        // the insert fails, it'll just re-attempt it. For now though,
        // to be on the safe side, we wait.
        factory._design._rev = res.rev;
        callback(null, factory._design);
      }
    });
  });
};

for ( var prop in Couchdb.prototype ){
	if ( !Couchelastic.prototype[prop] ) Couchelastic.prototype[prop] = Couchdb.prototype[prop]
}


