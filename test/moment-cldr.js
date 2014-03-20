var chai = require('chai'),
    moment = require('../moment-cldr'),
    Cldr = require('cldr.js'),
    fs = require('fs');

chai.should();

describe("moment-cldr", function () {
    before(function() {
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/ca-gregorian.json')));
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/dateFields.json')));
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/units.json')));
    }),

    describe("moment#cldr_human", function() {
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

    // "human tokens" : function (test) {
    //     var m = moment("2014-01-02T05:06:07.008");

    //     test.equal(m.human("h m"), "5:06 AM", "h m");
    //     test.equal(m.human("y dM"), "1/2/2014", "M d y");
    //     // TODO: appendItem's
    //     test.done();
    // },

    describe("duration#cldr_human", function() {
        it("handles relative duration", function() {
            var d = moment.duration;

            d(5, 'seconds').cldr_human(false).should.equal("in 5 seconds");
        });

        it("handles absolute duration", function() {
            var d = moment.duration;

            d(5, 'seconds').cldr_human(true).should.equal("5 seconds");
        });
    });
    // "duration simple format" : function (test) {
    //     var d = moment.duration;

    //     test.equal(d(5, 'seconds').human(), "in 5 seconds");
    //     test.equal(d(5, 'seconds').human(false), "in 5 seconds");
    //     test.equal(d(-5, 'seconds').human(false), "5 seconds ago");
    //     test.equal(d(5, 'seconds').human(true), "5 seconds");

    //     // TODO: Add for other units.
    //     test.done();
    // },

    // "duration advanced format" : function (test) {
    //     var d = moment.duration;

    //     test.equal(d(5, 'seconds').human({min: 'minutes'}), "in 0 minutes");
    //     test.equal(d(5, 'seconds').human({min: 'minutes', abs: true}), "0 minutes");
    //     test.equal(d(2, 'days').human({max: 'hours'}), "in 48 hours");
    //     test.equal(d(2, 'days').human({max: 'hours', abs: true}), "48 hours");

    //     test.equal(d(5, 'hours').human({min: 'seconds', max: 'hours'}), "in 5 hours");
    //     test.equal(d(5, 'hours').human({min: 'seconds', max: 'hours', abs: true}), "5 hours");

    //     // TODO: Add test for floating values
    //     test.done();
    // },

    // "moment calendar" : function (test) {
    //     var m = moment("5:06:07", "H:mm:ss");
    //     test.equal(m.clone().add(1, 'day').cldr_calendar({time: false}), "tomorrow");
    //     test.equal(m.clone().add(1, 'day').cldr_calendar({time: true}), "tomorrow, 5:06:07 AM");
    //     // TODO: Careful testing for relative week days.
    //     test.done();
    // }
});
