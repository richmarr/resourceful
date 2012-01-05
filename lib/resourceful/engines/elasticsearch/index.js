/*
 * elasticsearch/index.js: Elasticsearch engine wrapper
 *
 * (C) 2011 Richard Marr
 * MIT LICENCE
 *
 */

var resourceful = require('../../../resourceful'),
    Cache = resourceful.Cache,
    elastical = require('elastical');


var Elasticsearch = exports.Elasticsearch = function (config) {
  this.config = config = config || {};
  this.uri = config.uri;

  this.client = new(elastical.Client)( config.host || config.uri || '127.0.0.1', {
    port:  config.port || 9200,
    timeout:   true
  });

  //this.index = new(elastical.Index)( client, config.index );

  this.cache = new resourceful.Cache();
};

// es mapping
// couch filter?

Elasticsearch.prototype.protocol = 'elasticsearch';

Elasticsearch.prototype.search = function( query, callback ){
  this.client.search( query, function (err, results, res) {
      // `err` is an Error, or `null` on success.
      // `results` is an object containing search hits.
      // `res` is the full parsed ElasticSearch response data.
    if ( err ) return callback(err);
    return results.map(function(r){
      r._source._score = r._score;
      return r._source;
    });
  });
};

Elasticsearch.prototype.sync = function (factory, callback) {
  elastical.Index.putMapping( this.client, this.config.index, factory.resource, getMapping(factory), function(err){
    if ( err ) return callback(err);
    //elastical.Index.putRiver( this.client, this.config.index, factory.resource, getMapping(factory), callback);
callback();
  });
};

// Creates a mapping object from the Resource schema
function getMapping(factory){

  var name = factory.resource,
      result = {},
      mappings = {},
      props = factory.properties;

  for ( var name in props ){
    var prop = props[name];
    if ( prop.searchable == false || prop.type ){
      mappings[name] = {};
      if ( prop.searchable == false ) mappings[name].enabled = false;
      if ( prop.type ) mappings[name].type = prop.type;
    }
  }
  result[name] = { properties:mappings }
  return result;
}