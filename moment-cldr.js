//! moment-cldr.js
//! version : 0.0.1
//! authors : Iskren Chernev
//! license : MIT
//! momentjs.com

/*jshint -W015 */
;(function (undefined) {
/*jshint +W015 */
    // TODO(discuss): pass Zone to globalize.format
    // TODO: fillIn in globalize
    // TODO: Does our lang abbreviation play well with cldr's?
    // TODO: Check date/tokenizer.js or implement our own tokenizer
    // TODO: Implement format building by algo
    // * Split into date tokens, time tokens and additional ones (check
    //   java implementation from email discussion).
    // * Find date and time formats, that have the given (possibly
    //   more) tokens. Maybe expand some tokens (YY to YYYY).
    // * Use appendItem for the additional items
    // TODO: Implement
    // http://www.unicode.org/reports/tr35/tr35-dates.html#Parsing_Dates_Times.
    // * Extract tokens from format
    // * Use predefined
    // * Try to parse
    // TODO: float -> 2 digits only if necessary
    // TODO: implement smallFloat -> float only if abs < 1
    // TODO: imply smallFloat with min
    // TODO: unimplemented globalize.plural
    // http://www.unicode.org/reports/tr35/tr35-numbers.html#Language_Plural_Rules
    // TODO: moment vs cldr languages
    // TODO: Use globalize to format floats
    // TODO: Put makeAs in moment (export it)
    function factory(moment, Cldr, globalize) {
        // console.log("got moment", moment);
        // console.log("got cldr", cldr);
        // console.log("got globalize", globalize);

        var normalizeLength,  /* defined later */
            tokenFormat,  /* defined later */
            durationFormat,  /* defined later */
            calendar,  /* defined later */
            cldr_cache = {};

        function isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }

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
            if (isArray(path)) {
                path = path.join('/');
            }
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
                n: 'narrow'
            };

            return function (length) {
                if (length in shortToLong) {
                    length = shortToLong[length];
                }
                if (length === true || length == null) {
                    length = 'full';
                }
                return length;
            };
        }());

        normalizeUnits = (function() {
            var shortToLong = {
                ms: 'millisecond',
                s: 'second',
                m: 'minute',
                h: 'hour',
                d: 'day',
                w: 'week',
                M: 'month',
                y: 'year'
            };

            return function (unit) {
                unit = unit in shortToLong ? shortToLong[unit] : unit;
                return unit.replace(/s$/, '');
            };
        }());

        function cldrFormat(fmt, date, locale) {
            return globalize.format(date, {pattern: fmt}, locale);
        }

        function fillIn(fmt) {
            var args = [].slice.call(arguments, 1), i;

            for (i = 0; i < args.length; ++i) {
                fmt = fmt.replace('{' + i + '}', args[i]);
            }

            return fmt;
        }

        function combineDateTime(date, time, lang, junction_variant) {
            var cldrPath = 'cldr/main/{languageId}/dates/calendars/gregorian/',
                junction;

            if (junction_variant == null) {
                junction_variant = 'medium';
            }

            junction = cldrGet(lang, cldrPath + 'dateTimeFormats/' +
                    junction_variant);

            return fillIn(junction, time, date);
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
                return ['MM', 'D'];
            }

            function buildFormat(tokens, lang) {
                return 'MM-D';
            }

            return function (moment, args) {
                var tokens = extractTokens(args[0]),
                    lang = args[1] ? args[1] : moment.lang(),
                    fmt = buildFormat(tokens, lang);

                return cldrFormat(fmt, moment.toDate(), lang);
            };
        }());

        function dateTimeFormat(a_moment, options) {
            var date, time, junction,
                date_variant, time_variant, junction_variant,
                fmt,
                lang = options.lang ? options.lang : moment.lang(),
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
                // junction = cldrGet(lang, cldrPath + 'dateTimeFormats/' +
                //         junction_variant);
            }

            fmt = (date && time ?
                    combineDateTime(date, time, lang, junction_variant) :
                    date ? date : time);

            var res = cldrFormat(fmt, a_moment.toDate(), lang);
            return res;
        }

        moment.fn.human_parse = parseFormat;

        function parseFormat(string, format) {
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
                }
            },
            duration_units = 'second|minute|hour|day|month|year'.split('|');

            // Given amount and language return 'one', 'two', 'few', 'other'
            function getAmountCategory(amount, lang) {
                return amount === 1 ? 'one' : 'other';
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
                    options.lang = moment.lang();
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
                        amount = options['float'] ?
                            amount : Math.round(amount);
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
                    fmt = cldrGet(options.lang, cldr_path),
                    amount_str = options['float'] ?
                        unitAmount[1].toFixed(2) : unitAmount[1].toString();

                return fillIn(fmt, amount_str);
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
                    amount_str = options['float'] ?
                        unitAmount[1].toFixed(2) : unitAmount[1].toString();

                return fillIn(fmt, amount_str);
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
                time: 'short',
            };

            function processOptions(options) {
                options = extendMany({}, default_options, options);

                if (options.lang == null) {
                    // TODO: moment vs cldr languages
                    options.lang = moment.lang();
                }

                return options;
            }

            function makeAs(input, model) {
                return model._isUTC ? moment(input).zone(model._offset || 0) :
                    moment(input).local();
            }

            function detectDayDifference(anchor, aMoment, options) {
                var sod = makeAs(anchor, aMoment).startOf('day'),
                    diff = Math.floor(aMoment.diff(sod, 'days', true)),
                    cldr_path = 'main/{languageId}/dates/fields/' +
                        'day/relative-type-' + diff;

                return cldrGet(options.lang, cldr_path);
            }

            function detectWeekDifference(anchor, aMoment, options) {
                // TODO: language dependent start of week is not handled here.
                var weekdays = 'sun|mon|tue|wed|thu|fri|sat'.split('|'),
                    sow = makeAs(anchor, aMoment).startOf('week'),
                    raw_diff = aMoment.diff(sow, 'weeks', true),
                    cldr_path,
                    diff;

                // TODO: This logic is wrong. Check java code for proper diff
                // implementation across languages.
                if (raw_diff < 1) {
                    diff = 0;
                } else if (raw_diff > -1) {
                    diff = -1;
                }

                if (diff == null) {
                    return null;
                }

                cldr_path = ['main/{languageId}/dates/fields',
                      weekdays[aMoment.weekday()], 'relative-type-' + diff];
                return cldrGet(options.lang, cldr_path);

                // format = diff < -6 ? 'sameElse' :
                //     diff < -1 ? 'lastWeek' :
                //     diff < 0 ? 'lastDay' :
                //     diff < 1 ? 'sameDay' :
                //     diff < 2 ? 'nextDay' :
                //     diff < 7 ? 'nextWeek' : 'sameElse';
            }

            return function (m, options) {
                var date;

                options = processOptions(options);

                date = detectDayDifference(moment(), m, options) ||
                    detectWeekDifference(moment(), m, options);

                if (date) {
                    if (options.time === false) {
                        return date;
                    }

                    return combineDateTime(date,
                            m.cldr_human({time: options.time}), options.lang);
                }

                return m.human({date: 'medium', time: options.time});
            };
        }());

        moment.fn.cldr_calendar = function (options) {
            return calendar(this, options);
        };

        return moment;
    }

    if (typeof define === 'function' && define.amd) {
        define('moment-cldr', ['moment', 'cldr', 'globalize', 'globalize/date'], factory);
    } else if (typeof module !== 'undefined') {
        module.exports = factory(require('moment'), require('cldr.js'), require('globalize'));
    } else if (typeof window !== 'undefined' && window.moment && window.Cldr && window.Globalize) {
        factory(window.moment, window.Cldr, window.Globalize.Date);
    }
}).call(this);
