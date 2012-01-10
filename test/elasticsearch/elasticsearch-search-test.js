var assert = require('assert'),
    events = require('events'),
    elastical = require('elastical'),
    vows = require('vows'),
    resourceful = require('../../lib/resourceful');

resourceful.env = 'test';
resourceful.use('elasticsearch',{index:'resourceful-test'});

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
  "The index should be searchable with a simple query term": {
    topic: function () {
      var that = this;
      var Article = resourceful.define('Article', function () {
        this.property('author');
        this.property('title');
        this.property('tags');
        this.property('published', Boolean);
      });
      setTimeout(function(){
        Article.search("vim",function( err, resources ){
          that.callback(err,resources);
        });
      },1000); // HACK - there's a delay before these documents are available for search so I'm delaying this
    },
    "should return an article":function( err, resources ){
      assert.equal( resources.length, 1 );
    }
  }
}).export(module);