var chai = require('chai'),
    moment = require('../moment-cldr'),
    Cldr = require('cldr.js'),
    fs = require('fs');

chai.should();

describe("duration#cldr_human", function() {
    var d = moment.duration;

    before(function() {
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/ca-gregorian.json')));
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/dateFields.json')));
        Cldr.load(JSON.parse(fs.readFileSync('test/fixtures/en/units.json')));
    });

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
