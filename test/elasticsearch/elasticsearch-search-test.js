var assert = require('assert'),
    events = require('events'),
    elastical = require('elastical'),
    vows = require('vows'),
    resourceful = require('../../lib/resourceful');

resourceful.env = 'test';
resourceful.use('elasticsearch',{index:'resourceful-test'});

var Article; // Set this in module scope so we can refer to it a few times

vows.describe('resourceful/elasticsearch/search').addBatch({
  "An index containing articles and other resources": {
    topic: function () {
      var that = this;
      var client = new(elastical.Client)('127.0.0.1', {port:9200});
      client.deleteIndex('resourceful-test', function () {
        client.createIndex('resourceful-test', function () {
          client.bulk([
            {index:{ index:'resourceful-test', type:'Article', data:{ resource: 'Article', title: 'The Great Gatsby', published: true,  author: 'fitzgerald', tags: ['classic'] }}},
            {index:{ index:'resourceful-test', type:'Article', data:{ resource: 'Article', title: 'Finding vim',      published: false, author: 'cloudhead', tags: ['hacking', 'vi'] }}},
            {index:{ index:'resourceful-test', type:'Article', data:{ resource: 'Article', title: 'On Writing',       published: true,  author: 'cloudhead', tags: ['writing'] }}},
            {index:{ index:'resourceful-test', type:'Article', data:{ resource: 'Article', title: 'vi Zen',           published: false, author: 'cloudhead', tags: ['vi', 'zen'] }}},
            {index:{ index:'resourceful-test', type:'Article', data:{ resource: 'Article', title: 'Channeling force', published: true,  author: 'yoda',      tags: ['force', 'zen'] }}},
            {index:{ index:'resourceful-test', type:'Body', data:{ resource: 'Body',    name: 'fitzgerald' }}},
            {index:{ index:'resourceful-test', type:'Herring', data:{ resource: 'Herring',    name: 'Red', tags:['vim'] }}}
          ], function (err,res) {
            that.callback( err );
          });
        });
      })//*/that.callback();
    },
    "is created": function () {}
  }
}).addBatch({
  "Searching the index": {
    topic: function () {
      var that = this;
      Article = resourceful.define('Article', function () {
        this.property('author');
        this.property('title');
        this.property('tags');
        this.property('published', Boolean);
      });
      setTimeout(function(){
        that.callback();
      },1000); // HACK - there's a delay before these documents are available for search so I'm delaying this
    },
    "for a simple search term":{
      topic:function(){
        Article.search("vim",this.callback);
      },
      "should return results":function( err, resources ){
        assert.equal( resources.length, 1 );
      },
      "results should be valid Article objects":function( err, resources ){
        assert.equal( resources[0].resource, "Article" );
      },
      "results should be the one expected":function( err, resources ){
        assert.equal( resources[0].title, "Finding vim" );
      }
    }
  }
}).export(module);