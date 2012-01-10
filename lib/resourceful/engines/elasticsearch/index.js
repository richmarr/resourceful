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
  this.index = config.index || resourceful.env;

  this.client = new(elastical.Client)( config.host || config.uri || '127.0.0.1', {
    port:  config.port || 9200,
    timeout:   config.timeout || false
  });

  //this.index = new(elastical.Index)( client, config.index );

  this.cache = new resourceful.Cache();
};

// es mapping
// couch filter?

Elasticsearch.prototype.protocol = 'elasticsearch';

Elasticsearch.prototype.search = function( term, resource, callback ){

  var params = {}
  params.query = ( typeof term == 'string' ) ? {query_string:{query:term}} : term;
  params.filter = { term : { _type:resource } };
  params.index = this.index;

  this.client.search(params, function (err, results, res) {
      // `err` is an Error, or `null` on success.
      // `results` is an object containing search hits.
      // `res` is the full parsed ElasticSearch response data.
    if ( err ) return callback(err);

    var hits = results.hits, output = [];
    for ( var i in hits ){
      hits[i]._source._score = hits[i]._score;
      output.push(hits[i]._source);
    }
    callback(undefined,output);
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