var chai = require('chai'),
    moment = require('../moment-cldr'),
    Cldr = require('cldr.js'),
    fs = require('fs');

chai.should();

describe("duration#cldr_calendar", function() {
    var d = moment.duration;

    before(function() {
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/ca-gregorian.json')));
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/dateFields.json')));
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/units.json')));
    });

    it("handles tomorrow", function() {
        var m = moment("5:06:07", "H:mm:ss");
        m.clone().add(1, 'day').cldr_calendar({time: false})
            .should.equal("tomorrow");
        m.clone().add(1, 'day').cldr_calendar({time: 'medium'})
            .should.equal("tomorrow, 5:06:07 AM");
    });

    it("handles yesterday", function() {
        var m = moment("5:06:07", "H:mm:ss");

        m.clone().subtract(1, 'day').cldr_calendar({time: false})
            .should.equal("yesterday");
        m.clone().subtract(1, 'day').cldr_calendar({time: 'medium'})
            .should.equal("yesterday, 5:06:07 AM");
    });

    it("handles week diffs");
});
