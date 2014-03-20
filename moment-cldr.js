//! moment-cldr.js
//! version : 0.0.1
//! authors : Iskren Chernev
//! license : MIT
//! momentjs.com

/*jshint -W015 */
;(function (undefined) {
/*jshint +W015 */
    function factory(moment, Cldr, globalizeDate) {
        // console.log("got moment", moment);
        // console.log("got cldr", cldr);
        // console.log("got globalizeDate", globalizeDate);

        var normalizeLength,  /* defined later */
            tokenFormat,  /* defined later */
            durationFormat,  /* defined later */
            calendar,  /* defined later */
            cldr_cache = {};

        function extend(a, b) {
            for (var i in b) {
                if (b.hasOwnProperty(i)) {
                    a[i] = b[i];
                }
            }

            if (b.hasOwnProperty("toString")) {
                a.toString = b.toString;
            }

            if (b.hasOwnProperty("valueOf")) {
                a.valueOf = b.valueOf;
            }

            return a;
        }

        function extendMany(a) {
            var args = [].slice.call(arguments, 1), i;
            for (i = 0; i < args.length; ++i) {
                if (args[i] != null) {
                    extend(a, args[i]);
                }
            }
            return a;
        }

        function cldrInstance(lang) {
            if (!(lang in cldr_cache)) {
                cldr_cache[lang] = new Cldr(lang);
            }

            return cldr_cache[lang];
        }

        function cldrGet(lang, path) {
            return cldrInstance(lang).get(path);
        }

        function arrayIndexOf(array, element) {
            var i, l = array.length;
            for (i = 0; i < l; ++i) {
                if (array[i] === element) {
                    return i;
                }
            }
            return -1;
        }

        normalizeLength = (function () {
            var shortToLong = {
                f: 'full',
                l: 'long',
                m: 'medium',
                s: 'short',
                n: 'narrow',
            };

            return function (length) {
                if (length in shortToLong) {
                    length = shortToLong[length];
                }
                if (length === true) {
                    length = 'full';
                }
                return length;
            };
        }());

        normalizeUnits = (function() {
            return function (unit) {
                // TODO: Implement proper normalization
                return unit;
            };
        }());

        function cldrFormat(fmt, date, locale) {
            // TODO(discuss): pass Zone?
            return globalizeDate.format(date, {pattern: fmt}, locale);
        }

        // TODO: This should be somewhere in globalize.
        // Replace {0}, {1} ... with the following arguments.
        function fillIn(fmt) {
            var args = [].slice.call(arguments, 1), i;

            for (i = 0; i < args.length; ++i) {
                fmt = fmt.replace('{' + i + '}', args[i]);
            }

            return fmt;
        }

        moment.fn.cldr_human = function () {
            var args = [].slice.call(arguments, 0);
            if (typeof args[0] === 'string') {
                return tokenFormat(this, args);
            } else {
                return dateTimeFormat(this, args[0]);
            }
        };

        tokenFormat = (function () {
            function extractTokens(fmt) {
                // TODO: Check date/tokenizer.js or implement
                return ['MM', 'D'];
            }

            function buildFormat(tokens, lang) {
                // TODO: Implement
                // * Split into date tokens, time tokens and additional ones (check
                //   java implementation from email discussion).
                // * Find date and time formats, that have the given (possibly
                //   more) tokens. Maybe expand some tokens (YY to YYYY).
                // * Use appendItem for the additional items
                return 'MM-D';
            }

            return function (moment, args) {
                var tokens = extractTokens(args[0]),
                    lang = args[1] ? args[1] : moment.lang()._abbr,
                    fmt = buildFormat(tokens, lang);

                return cldrFormat(fmt, moment.toDate(), lang);
            };
        }());

        function dateTimeFormat(moment, options) {

            var date, time, junction,
                date_variant, time_variant, junction_variant,
                fmt,
                // TODO: Does our lang abbreviation play well with cldr's?
                lang = options.lang ? options.lang : moment.lang()._abbr,
                cldrPath = 'cldr/main/{languageId}/dates/calendars/gregorian/';

            if (options.datetime) {
                options.date = options.time = options.datetime;
            }

            if (options.date) {
                date_variant = normalizeLength(options.date);
                date = cldrGet(lang, cldrPath + 'dateFormats/' + date_variant);
            }

            if (options.time) {
                time_variant = normalizeLength(options.time);
                time = cldrGet(lang, cldrPath + 'timeFormats/' + time_variant);
            }

            if (date && time) {
                junction_variant = (date_variant === time_variant ?
                        date_variant : 'medium');
                junction = cldrGet(lang, cldrPath + 'dateTimeFormats/' +
                        junction_variant);
            }

            fmt = (date && time ?
                    fillIn(junction, time, date) :
                    date ? date : time);

            var res = cldrFormat(fmt, moment.toDate(), lang);
            return res;
        }

        moment.fn.human_parse = parseFormat;

        function parseFormat(string, format) {
            // TODO: Implement
            // http://www.unicode.org/reports/tr35/tr35-dates.html#Parsing_Dates_Times.
            // * Extract tokens from format
            // * Use predefined
            // * Try to parse
        }

        durationFormat = (function () {
            var default_options = {
                // with: '<unit>'
                min: 'second',
                max: 'year',
                'float': false,
                length: 'long',
                abs: false,
                cutoff: {
                    second: 45,
                    minute: 45,
                    hour: 22,
                    day: 25,
                    month: 10,
                    // TODO (later): more complicated day -> month rounding?
                }
            },
            duration_units = 'second|minute|hour|day|month|year'.split('|');

            // Given amount and language return 'one', 'two', 'few', 'other'
            function getAmountCategory(amount, lang) {
                // TODO: unimplemented globalize.plural
                // http://www.unicode.org/reports/tr35/tr35-numbers.html#Language_Plural_Rules
                return 'other';
            }

            function processOptions(duration, options) {
                if (options === true) {
                    // abs: true
                    options = extendMany({}, default_options, {abs: true});
                } else if (options === false) {
                    // abs: false
                    options = extendMany({}, default_options, {abs: false});
                } else {
                    // custom options
                    options = extendMany({}, default_options, options);
                    options.cutoff = extendMany({}, default_options.cutoff, options.cutoff);
                }

                if (options['with']) {
                    options.min = options.max = options['with'];
                    options['with'] = null;
                }
                if (options.min == null) {
                    options.min = 'second';
                }
                if (options.max == null) {
                    options.max = 'year';
                }


                if (options.lang == null) {
                    // TODO: moment vs cldr languages
                    options.lang = duration.lang()._abbr;
                }

                options.min = normalizeUnits(options.min);
                options.max = normalizeUnits(options.max);
                options.length = normalizeLength(options.length);

                return options;
            }

            /*
             * min: 'seconds', max: 'days', 50 ms -> 0 seconds
             * min: 'days', max: 'years', 5 hours -> 0 days
             *
             * min: 'seconds', max: 'days', 5 hours -> 5 hours
                 *
             * min: 'seconds', max: 'days', 5 months -> 150 days
             */
            function getUnitAndAmount(duration, options) {
                var i, unit, amount,
                    start_i = arrayIndexOf(duration_units, options.min),
                    end_i = arrayIndexOf(duration_units, options.max);

                for (i = start_i; i <= end_i; ++i) {
                    unit = duration_units[i];
                    amount = Math.abs(duration.as(unit));
                    if (i === end_i || amount < options.cutoff[unit]) {
                        return [unit, amount];
                    }
                }
            }

            function formatAbsoluteDuration(duration, options) {
                var unitAmount = getUnitAndAmount(duration, options),
                    amount_category = getAmountCategory(unitAmount[1],
                            options.lang),
                    cldr_path = 'cldr/main/{languageId}/units/' + options.length +
                            '/duration-' + unitAmount[0] + '/unitPattern-count-' + amount_category,
                    fmt = cldrGet(options.lang, cldr_path);

                return fillIn(fmt, unitAmount[1]);
            }

            function formatRelativeDuration(duration, options) {
                // TODO (later): Handle 'now' differently?
                var unitAmount = getUnitAndAmount(duration, options),
                    ms = +duration,
                    amount_category = getAmountCategory(unitAmount[1],
                            options.lang),
                    future_past = (ms >= 0 ? 'future' : 'past'),
                    cldr_path = 'cldr/main/{languageId}/dates/' +
                            'fields/' + unitAmount[0] + '/' +
                            'relativeTime-type-' + future_past + '/' +
                            'relativeTimePattern-count-' + amount_category;
                    fmt = cldrGet(options.lang, cldr_path);

                return fillIn(fmt, unitAmount[1]);
            }

            return function (duration, options) {
                // TODO (later): Ask cldr guys for imprecise units (a few sth)
                // TODO (later): Support multiple units
                var unitAmount, fmt;

                options = processOptions(duration, options);
                if (options.abs) {
                    return formatAbsoluteDuration(duration, options);
                } else {
                    return formatRelativeDuration(duration, options);
                }
            };
        }());

        moment.duration.fn.cldr_human = function (options) {
            return durationFormat(this, options);
        };

        calendar = (function () {
            // TODO: Support finer time on/off support (mimic existing
            // behavior)
            var default_options = {
                time: true,
            };

            function detectDayDifference(anchor, aMoment, options) {
                var sod = makeAs(anchor, aMoment).startOf('day'),
                    diff = aMoment.diff(sod, 'days', true);

                return cldr.get('main', options.lang, 'dates', 'fields',
                    'day', 'relative-type-' + diff);
            }

            function detectWeekDifference(anchor, aMoment, options) {
                // TODO: language dependent start of week is not handled here.
                var weekdays = 'sun|mon|tue|wed|thu|fri|sat'.split('|'),
                    sow = makeAs(anchor, aMoment).startOf('week'),
                    raw_diff = aMoment.diff(sow, 'weeks', true),
                    diff;

                // TODO: This logic is wrong. Check java code for proper diff
                // implementation across languages.
                if (raw_diff < 1) {
                    diff = 0;
                } else if (raw_diff > -1) {
                    diff = -1;
                }

                return diff != null ?
                    cldr.get('main', options.lang, 'dates', 'fields',
                            weekdays[aMoment.weekday()],
                            'relative-type-' + diff) : null;

                // format = diff < -6 ? 'sameElse' :
                //     diff < -1 ? 'lastWeek' :
                //     diff < 0 ? 'lastDay' :
                //     diff < 1 ? 'sameDay' :
                //     diff < 2 ? 'nextDay' :
                //     diff < 7 ? 'nextWeek' : 'sameElse';
            }

            return function (aMoment, options) {
                // FIXME: Handle default options
                // FIXME: Implement combineDateTime
                var fmt;

                fmt = detectDayDifference(moment(), aMoment, options) ||
                    detectWeekDifference(moment(), aMoment, options);

                if (fmt) {
                    return combineDateTime(fmt,
                        aMoment.human({time: options.time}));
                }

                return this.human({date: 'medium', time: options.time});
            };
        }());


        moment.fn.cldr_calendar = function (options) {
            return calendar(this, options);
        };

        return moment;
    }

    if (typeof define === 'function' && define.amd) {
        define('moment-cldr', ['moment', 'cldr', 'globalize/date'], factory);
    } else if (typeof module !== 'undefined') {
        module.exports = factory(require('moment'), require('cldr.js'), require('globalize/dist/globalize/date'));
    } else if (typeof window !== 'undefined' && window.moment && window.Cldr && window.Globalize) {
        factory(window.moment, window.Cldr, window.Globalize.Date);
    }
}).call(this);
