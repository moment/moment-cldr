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
        var d = moment.duration;

        describe("relative formatting", function() {
            it("assumes relative duration without arguments", function() {
                d(1, 'second').cldr_human().should.equal("in 1 second");
                d(5, 'seconds').cldr_human().should.equal("in 5 seconds");
                d(-1, 'second').cldr_human().should.equal("1 second ago");
                d(-5, 'seconds').cldr_human().should.equal("5 seconds ago");
            });

            it("handles future relative duration", function() {
                d(1, 'second').cldr_human(false).should.equal("in 1 second");
                d(5, 'seconds').cldr_human(false).should.equal("in 5 seconds");
                d(1, 'minute').cldr_human(false).should.equal("in 1 minute");
                d(5, 'minutes').cldr_human(false).should.equal("in 5 minutes");
                d(1, 'hour').cldr_human(false).should.equal("in 1 hour");
                d(5, 'hours').cldr_human(false).should.equal("in 5 hours");
                d(1, 'day').cldr_human(false).should.equal("in 1 day");
                d(5, 'days').cldr_human(false).should.equal("in 5 days");
                d(1, 'month').cldr_human(false).should.equal("in 1 month");
                d(5, 'months').cldr_human(false).should.equal("in 5 months");
                d(1, 'year').cldr_human(false).should.equal("in 1 year");
                d(5, 'years').cldr_human(false).should.equal("in 5 years");
            });

            it("handles past relative duration", function() {
                d(-1, 'second').cldr_human(false).should.equal("1 second ago");
                d(-5, 'seconds').cldr_human(false).should.equal("5 seconds ago");
                d(-1, 'minute').cldr_human(false).should.equal("1 minute ago");
                d(-5, 'minutes').cldr_human(false).should.equal("5 minutes ago");
                d(-1, 'hour').cldr_human(false).should.equal("1 hour ago");
                d(-5, 'hours').cldr_human(false).should.equal("5 hours ago");
                d(-1, 'day').cldr_human(false).should.equal("1 day ago");
                d(-5, 'days').cldr_human(false).should.equal("5 days ago");
                d(-1, 'month').cldr_human(false).should.equal("1 month ago");
                d(-5, 'months').cldr_human(false).should.equal("5 months ago");
                d(-1, 'year').cldr_human(false).should.equal("1 year ago");
                d(-5, 'years').cldr_human(false).should.equal("5 years ago");
            });

            describe("floating point units", function() {
                it("rounds with float: false", function() {
                    d({'m': 1}).cldr_human({'float': false}).should
                        .equal("in 1 minute");
                    d({'m': 1, 's': 2}).cldr_human({'float': false}).should
                        .equal("in 1 minute");
                    d({'m': 1, 's': 29}).cldr_human({'float': false}).should
                        .equal("in 1 minute");
                    d({'m': 1, 's': 30}).cldr_human({'float': false}).should
                        .equal("in 2 minutes");
                    d({'m': 1, 's': 45}).cldr_human({'float': false}).should
                        .equal("in 2 minutes");
                });

                it("shows hundreths with float: true", function() {
                    d({'m': 1}).cldr_human({'float': true}).should
                        .equal("in 1.00 minute");
                    d({'m': 1, 's': 30}).cldr_human({'float': true}).should
                        .equal("in 1.50 minutes");
                    d({'m': 1, 's': 45}).cldr_human({'float': true}).should
                        .equal("in 1.75 minutes");
                    d({'m': 1, 's': 46}).cldr_human({'float': true}).should
                        .equal("in 1.77 minutes");
                });
            });

            describe("min option", function() {
                it("is no-op for larger units", function() {
                    d({'h': 1}).cldr_human({min: 'm'}).should.equal('in 1 hour');
                    d({'h': 1}).cldr_human({min: 'h'}).should.equal('in 1 hour');
                });

                it("caps for smaller units", function() {
                    d({'m': 1}).cldr_human({min: 'd'}).should.equal('in 0 days');
                    d({'h': 1}).cldr_human({min: 'd'}).should.equal('in 0 days');
                });
            });

            describe("max option", function() {
                it("is no-op for smaller units", function() {
                    d({'m': 1}).cldr_human({max: 'h'}).should.equal('in 1 minute');
                    d({'h': 1}).cldr_human({max: 'h'}).should.equal('in 1 hour');
                });

                it("caps for larger units", function() {
                    d({'d': 1}).cldr_human({max: 'm'}).should.equal('in 1440 minutes');
                    d({'h': 1}).cldr_human({max: 'm'}).should.equal('in 60 minutes');
                });
            });

            describe("with option", function() {
                it("specifies the unit to use", function() {
                    d({'M': 1}).cldr_human({'with': 'd'}).should.equal('in 30 days');
                    d({'d': 1}).cldr_human({'with': 'd'}).should.equal('in 1 day');
                    d({'m': 1}).cldr_human({'with': 'd'}).should.equal('in 0 days');
                    d({'m': 1}).cldr_human({'with': 'h'}).should.equal('in 0 hours');
                    d({'m': 1}).cldr_human({'with': 'h', 'float': true}).should.equal('in 0.02 hours');
                });
            });
        });

        describe("absolute formatting", function() {
            it("handles positive absolute duration", function() {
                d(1, 'second').cldr_human(true).should.equal("1 second");
                d(5, 'seconds').cldr_human(true).should.equal("5 seconds");
                d(1, 'minute').cldr_human(true).should.equal("1 minute");
                d(5, 'minutes').cldr_human(true).should.equal("5 minutes");
                d(1, 'hour').cldr_human(true).should.equal("1 hour");
                d(5, 'hours').cldr_human(true).should.equal("5 hours");
                d(1, 'day').cldr_human(true).should.equal("1 day");
                d(5, 'days').cldr_human(true).should.equal("5 days");
                d(1, 'month').cldr_human(true).should.equal("1 month");
                d(5, 'months').cldr_human(true).should.equal("5 months");
                d(1, 'year').cldr_human(true).should.equal("1 year");
                d(5, 'years').cldr_human(true).should.equal("5 years");
            });

            it("handles negative absolute duration", function() {
                d(-1, 'second').cldr_human(true).should.equal("1 second");
                d(-5, 'seconds').cldr_human(true).should.equal("5 seconds");
                d(-1, 'minute').cldr_human(true).should.equal("1 minute");
                d(-5, 'minutes').cldr_human(true).should.equal("5 minutes");
                d(-1, 'hour').cldr_human(true).should.equal("1 hour");
                d(-5, 'hours').cldr_human(true).should.equal("5 hours");
                d(-1, 'day').cldr_human(true).should.equal("1 day");
                d(-5, 'days').cldr_human(true).should.equal("5 days");
                d(-1, 'month').cldr_human(true).should.equal("1 month");
                d(-5, 'months').cldr_human(true).should.equal("5 months");
                d(-1, 'year').cldr_human(true).should.equal("1 year");
                d(-5, 'years').cldr_human(true).should.equal("5 years");
            });

            describe("floating point units", function() {
                it("rounds with float: false", function() {
                    d({'m': 1}).cldr_human({'float': false, abs: true}).should
                        .equal("1 minute");
                    d({'m': 1, 's': 2}).cldr_human({'float': false, abs: true}).should
                        .equal("1 minute");
                    d({'m': 1, 's': 29}).cldr_human({'float': false, abs: true}).should
                        .equal("1 minute");
                    d({'m': 1, 's': 30}).cldr_human({'float': false, abs: true}).should
                        .equal("2 minutes");
                    d({'m': 1, 's': 45}).cldr_human({'float': false, abs: true}).should
                        .equal("2 minutes");
                });

                it("shows hundreths with float: true", function() {
                    d({'m': 1}).cldr_human({'float': true, abs: true}).should
                        .equal("1.00 minute");
                    d({'m': 1, 's': 30}).cldr_human({'float': true, abs: true}).should
                        .equal("1.50 minutes");
                    d({'m': 1, 's': 45}).cldr_human({'float': true, abs: true}).should
                        .equal("1.75 minutes");
                    d({'m': 1, 's': 46}).cldr_human({'float': true, abs: true}).should
                        .equal("1.77 minutes");
                });
            });

            describe("unit lengths", function() {
                it("displays long units by default", function() {
                    d({'m': 1}).cldr_human({abs: true}).should.equal("1 minute");
                    d({'m': 5}).cldr_human({abs: true}).should.equal("5 minutes");
                });

                it("handles length: short", function() {
                    d({'m': 1}).cldr_human({length: 'short', abs: true}).should
                        .equal("1 min");
                    d({'m': 5}).cldr_human({length: 'short', abs: true}).should
                        .equal("5 mins");
                });

                it("handles length: narrow", function() {
                    d({'m': 1}).cldr_human({length: 'narrow', abs: true}).should
                        .equal("1m");
                    d({'m': 5}).cldr_human({length: 'narrow', abs: true}).should
                        .equal("5m");
                });
            });

            describe("min option", function() {
                it("is no-op for larger units", function() {
                    d({'h': 1}).cldr_human({min: 'm', abs: true}).should.equal('1 hour');
                    d({'h': 1}).cldr_human({min: 'h', abs: true}).should.equal('1 hour');
                });

                it("caps for smaller units", function() {
                    d({'m': 1}).cldr_human({min: 'd', abs: true}).should.equal('0 days');
                    d({'h': 1}).cldr_human({min: 'd', abs: true}).should.equal('0 days');
                });
            });

            describe("max option", function() {
                it("is no-op for smaller units", function() {
                    d({'m': 1}).cldr_human({max: 'h', abs: true}).should.equal('1 minute');
                    d({'h': 1}).cldr_human({max: 'h', abs: true}).should.equal('1 hour');
                });

                it("caps for larger units", function() {
                    d({'d': 1}).cldr_human({max: 'm', abs: true}).should.equal('1440 minutes');
                    d({'h': 1}).cldr_human({max: 'm', abs: true}).should.equal('60 minutes');
                });
            });

            describe("with option", function() {
                it("specifies the unit to use", function() {
                    d({'M': 1}).cldr_human({'with': 'd', abs: true}).should.equal('30 days');
                    d({'d': 1}).cldr_human({'with': 'd', abs: true}).should.equal('1 day');
                    d({'m': 1}).cldr_human({'with': 'd', abs: true}).should.equal('0 days');
                    d({'m': 1}).cldr_human({'with': 'h', abs: true}).should.equal('0 hours');
                    d({'m': 1}).cldr_human({'with': 'h', 'float': true, abs: true}).should.equal('0.02 hours');
                });
            });
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
