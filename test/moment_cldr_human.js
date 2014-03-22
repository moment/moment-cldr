var chai = require('chai'),
    moment = require('../moment-cldr'),
    Cldr = require('cldr.js'),
    fs = require('fs');

chai.should();

describe("moment#cldr_human", function() {
    before(function() {
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/ca-gregorian.json')));
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/dateFields.json')));
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/units.json')));
    });

    beforeEach(function() {
        this.m = moment("2014-01-02T05:06:07.008");
    });

    it("handles {date: length}", function () {
        // var m = moment("2014-01-02T05:06:07.008"), zone = m.format("ZZ");
        this.m.cldr_human({date: "full"}).should.equal("Thursday, January 2, 2014");
        this.m.cldr_human({date: true}).should.equal("Thursday, January 2, 2014");
        this.m.cldr_human({date: "long"}).should.equal("January 2, 2014");
        this.m.cldr_human({date: "medium"}).should.equal("Jan 2, 2014");
        this.m.cldr_human({date: "short"}).should.equal("1/2/14");

    });

    it("handles {time: length}", function() {
        // console.log("got zone", zone);
        // m.cldr_human({time: "full"}).should.equal("5:06:07 AM " + zone);
        // m.cldr_human({time: true}).should.equal("5:06:07 AM " + zone);
        // m.cldr_human({time: "long"}).should.equal("5:06:07 AM " + zone);

        this.m.cldr_human({time: "medium"}).should.equal("5:06:07 AM");
        this.m.cldr_human({time: "short"}).should.equal("5:06 AM");
    });

    it("handles {datetime: length}", function() {
        // m.cldr_human({datetime: "full"}).should.equal("Thursday, January 2, 2014 at 5:06:07 AM " + zone);
        // m.cldr_human({datetime: "long"}).should.equal("January 2, 2014 at 5:06:07 AM " + zone);
        this.m.cldr_human({datetime: "medium"}).should.equal("Jan 2, 2014, 5:06:07 AM");
        this.m.cldr_human({datetime: "short"}).should.equal("1/2/14, 5:06 AM");
    });

    it("handles {date: date_length, time: time_length}", function() {
        this.m.cldr_human({date: "full", time: "medium"}).should.equal("Thursday, January 2, 2014, 5:06:07 AM");
        this.m.cldr_human({date: "medium", time: "short"}).should.equal("Jan 2, 2014, 5:06 AM");


        // TODO: The following won't work without zones
        // var variants = "full|long|medium|short".split('|'), i, j,
        //         m = moment("2014-01-02T05:06:07.008");

        // for (i = 0; i < variants.length; ++i) {
        //     for (j = 0; j < variants.length; ++j) {
        //         if (i == j) {
        //             continue;
        //         }
        //         test.equal(m.cldr_human({date: variants[i], time: variants[j]}),
        //                 m.cldr_human({date: variants[i]}) + ', ' + m.cldr_human({time: variants[j]}),
        //                 "date: " + variants[i] + " time: " + variants[j]);
        //     }
        // }
    });
});
