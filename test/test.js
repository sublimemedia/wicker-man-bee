var expect = require("chai").expect;
var WMBee = require("../dist/WMBee");
var Promise = require("bluebird");

describe("Bee can exist", function() {
  var testBee = new WMBee();

  it("Should be an object", function(){
    expect(testBee).to.be.an("object");
  });

  it("Should be a Bee", function(){
    expect(testBee).to.be.instanceOf(WMBee);
  });

  it("It can handle being set", function(){
    testBee.set();
  });
});

describe("Bee recieves correct value when expected parameters are given", function(){
  var b, valToSet;

  beforeEach(function() {
    b = new WMBee();
    valToSet = 5;
  });

  function dobuleNum(num) {
    return num * 2;
  }

  it("#onValue()", function(done){
    b
    .onValue(function(val){
      expect(val).to.equal(valToSet);
      done();
    });

    b.set(valToSet);
  });

  it("#map()#onValue()", function(done){
    b
    .map(dobuleNum)
    .onValue(function(val){
      expect(val).to.equal(dobuleNum(valToSet));
      done();
    });

    b.set(valToSet);
  });

  it("#filter()#onValue() Value reported", function(done){
    b
    .filter(function(val){
      return !isNaN(val);
    })
    .onValue(function(val) {
      expect(val).to.equal(valToSet);
      done();
    });

    b.set(valToSet);
  });

  it("#filter()#onValue() Value ignored", function(done){
    b
    .filter(function(val){
      return isNaN(val);
    })
    .onValue(function(val) {
      expect(val).to.be.undefined;
      done();
    });

    setTimeout(done, 30);
    b.set(valToSet);
  });

  it("#delay()#onValue()", function(done) {
    var dAmount = 50,
      start;

    b
    .onValue(function(val) {
      start = Date.now();
    })
    .delay(dAmount)
    .onValue(function(val){
      var diff = Date.now() - start;

      expect(val).to.equal(valToSet);
      expect(diff).to.be.closeTo(dAmount, 15);

      done();
    });

    b.set(valToSet);
  });

  it("#toPromise()", function(done) {
    b
    .toPromise()
    .then(function(val) {
      expect(val).to.be.equal(valToSet);
      done();
    });

    b.set(valToSet);
  });

  it("#unique()", function(done) {
    b
    .unique()
    .onValue(function(val) {
      expect(val).to.be.equal(valToSet);
      done();
    });

    b.set(valToSet);
  });

  it("#unique() multiple sets", function(done) {
    var aValToSet = 2,
      lValToSet = {},
      output = [];

    b
    .unique()
    .onValue(function(val) {
      output.push(val);

      if (val === lValToSet) {
        expect(output).to.have.length(3);
        expect(output).to.deep.equal([valToSet, aValToSet, lValToSet]);
        done();
      }
    });

    b.set(valToSet);
    b.set(aValToSet);
    b.set(aValToSet);
    b.set(valToSet);
    b.set(lValToSet);
  });

  describe("Bee can chain", function() {
    var b, valToSet;

    beforeEach(function() {
      b = new WMBee();
      valToSet = 5;
    });

    function testAllChain(bee) {
      return bee
        .filter(function(val) {
          return !isNaN(val);
        })
        .map(function(val) {
          return val;
        })
        .unique()
        .delay(10)
        .onValue(function() {});
    }

    it("Bee chains vertically", function(done) {
      testAllChain(b)
      .onValue(function(val) {
        expect(val).to.equal(valToSet);
        done();
      });

      b.set(valToSet);
    });

    it("Bee chains vertically and horizontally", function(done) {
      var promises = [],
        length = 5;

      for(var i = 0; i < length; i++) {
        promises.push(new Promise(function(resolve, reject) {
          testAllChain(b)
          .onValue(resolve);
        }));
      }

      Promise.all(promises)
      .then(function(vals){
        expect(vals).to.have.length(length);

        try {
          vals
          .forEach(function(val){
            expect(val).to.equal(valToSet);
          });

          done();
        } catch(e) {
          done(e);
        }
      })
      .catch(function(msg){
        throw msg;
        done();
      });

      b.set(valToSet);
    });

  });
});

describe("Bee handles missing/incorrect input", function(){
  var b, valToSet;

  beforeEach(function() {
    b = new WMBee();
    valToSet = 5;
  });

  function wait(done) {
    return setTimeout(done, 30);
  }

  it("#onValue()", function(done){
    b
    .onValue();

    wait(done);
    b.set(valToSet);
  });

  it("#map()#onValue()", function(done){
    b
    .map()
    .onValue(function(val){
      expect(val).to.equal(valToSet);
      done();
    });

    b.set(valToSet);
  });

  it("#filter()#onValue()", function(done){
    b
    .filter()
    .onValue(function(val) {
      throw "Should not pass filter";
      done();
    });

    wait(done);
    b.set(valToSet);
  });

  it("#delay()#onValue()", function(done) {
    var start;

    b
    .onValue(function(val) {
      start = Date.now();
    })
    .delay()
    .onValue(function(val){
      var diff = Date.now() - start;

      expect(val).to.equal(valToSet);
      expect(diff).to.be.closeTo(0, 5);

      done();
    });

    b.set(valToSet);
  });
});
