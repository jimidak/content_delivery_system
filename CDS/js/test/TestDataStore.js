var assert = require('assert');
const fs = require('fs');

process.env.cf_datastore_location='./test.db';
if(fs.existsSync(process.env.cf_datastore_location))
    fs.unlink(process.env.cf_datastore_location);
var datastore = require('../Datastore');

describe('Datastore',function(){
       before(function(done){
           datastore.newDataStore().then(function(){
               done();
           });
       });


    after(function(){
        //fs.unlink(process.env.cf_datastore_location);
    });

    describe('#set', function(){
        var conn=new datastore.Connection("TestDataStore");

        it('should store a value to meta and return nothing', function(done){
            datastore.set(conn,'meta','key','something').done(function(value){
                done();
            },function(err){
                //console.error(err);
                done(err);
            })
        });
        it('should store a value to media and return nothing', function(){
            assert.doesNotThrow(function(){
                datastore.set(conn,'media','mediaKey','somethingElse');
            });
        });
    });
    describe('#get', function(){
        var conn=new datastore.Connection("TestDataStore");
        it('should return the previously set value from meta', function(test_completed) {
            datastore.get(conn,'meta','key').done(function(rtn){
                assert.equal(rtn.value,'something');
                assert.equal(rtn.type,'meta');
                assert.equal(rtn.key,'key');
                test_completed();
            }, function(err){
                test_completed(err);
            });

        });
        it('should return the previously set value from media', function(test_completed) {
            datastore.get(conn,'media','mediaKey').done(function(rtn){
                assert.equal(rtn.value,'somethingElse');
                assert.equal(rtn.type,'media');
                assert.equal(rtn.key,'mediaKey');
                test_completed();
            }, function(err){
                //console.error(err);
                test_completed(err);
            });

        });
        it('should return placeholder text for an unknown key', function(test_completed) {
            datastore.get(conn,'meta','unknownkey').done(function(rtn){
                assert.equal(rtn.value,'(value not found)');
                assert.equal(rtn.type,'meta');
                assert.equal(rtn.key,'unknownkey');
                test_completed();
            }, function(err){
                test_completed(err);
            });
        });
        // it('should return the previously set value from media', function(){
        //     assert.equal(datastore.get('media','mediaKey'),'somethingElse');
        // });
    });
    describe('#substituteString',function(){
        var conn=new datastore.Connection("TestDataStore");
       it('should not modify a string without braces in', function(test_completed){
            datastore.substituteString(conn,"test string with no braces").done(function(value){
               assert.equal(value,"test string with no braces");
                test_completed();
           }, function(err){
                test_completed(err);
            });
       });
        it('should substitute {hour}:{min} for the current time', function(){

        });
        it('should substitute a value for {meta:key}', function (test_completed) {
            datastore.substituteString(conn,"I have a {meta:key} with {media:mediaKey}").done(function(value){
                assert.equal(value,"I have a something with somethingElse");
                test_completed();
            }, function(err){
                test_completed(err);
            });
        });
        it('should substitute placeholder for {meta:undefinedkey}', function() {
            datastore.substituteString(conn,"I have a {meta:undefinedkey}").done(function(value){
                assert.equal(value,"I have a (value not found)");
                test_completed();
            }, function(err){
                test_completed(err);
            });
        });
    });
});
