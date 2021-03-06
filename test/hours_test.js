var assert = require('assert')
	, Hours = require('../index');

var daysObject = { "Sun" : 0, "Mon" : 1, "Tue" : 2, "Wed" : 3, "Thu" : 4, "Fri" : 5, "Sat" : 6 }
	, daysArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

describe("Hours", function () {
	it("validate", function () {
		var cases = {
			"Mo-Fr 9:00-17:00": true,
			"Tu-Th":            true,
			"Mo,Tu-Th 0:00-22:00" : true,
			"qwertyuiop[":      false,
		}

		for (var testCase in cases) {
			var outcome = cases[testCase];
			assert.equal(outcome, Hours.validate(testCase), testCase + " : " + outcome + " != " + Hours.validate(testCase));
		}

	});

	it("contains", function () {
		var cases = {
			"Su-Sa" : { date : new Date(), contains : true },
			"Su-Th 9:00-17:00" : { date : Hours.relativeDate("Wed",15,30), contains : true },
			"We 9:00-16:00" : { date : Hours.relativeDate("Wed",16,30), contains : false },
		}

		for (var testCase in cases) {
			var outcome = cases[testCase];
			assert.equal(outcome.contains, Hours.containsDate(testCase, outcome.date), testCase + " expected: " +  outcome.contains + " received: " + Hours.containsDate(testCase, outcome.date));
		}
	});

	it('openNow', function(){
		var cases = [
			{ hours : ["Su-Sa"], outcome : true },
		];

		for (var i=0, testCase; testCase= cases[i]; i++) {
			var outcome = testCase.outcome
				, hours = testCase.hours;
			assert.equal(outcome, Hours.openNow(hours), testCase + " : " + outcome + " != " + Hours.openNow(hours));
		}
	});

	it('nextOpen', function () {
		var nextMonday = Hours.relativeDate("Mon",10,30);
		nextMonday.setDate(nextMonday.getDate() + 7);

		var cases = [
			// {	date : Hours.relativeDate("Mon", 4, 00),
			//   hours : ["Tu-We 17:00-22:00"], 
			//   outcome : Hours.relativeDate("Tue",17,00) },
			// {	date : Hours.relativeDate("Wed", 4, 00),
			//   hours : ["Sa,Fr 9:00-11:00"], 
			//   outcome : Hours.relativeDate("Fri",9,00) },
			// { date : Hours.relativeDate("Mon",11,25),
			// 	hours : ["Su 10:00-11:00"],
			// 	outcome : Hours.relativeDate("Sun", 10,00) },
			{ date : Hours.relativeDate("Mon", 11, 30),
				hours : ["Mo 10:30-11:15"],
				outcome : nextMonday
			}
		]

		for (var i=0, test; test=cases[i]; i++) {
			assert.equal(test.outcome.valueOf(), Hours.nextOpen(test.hours, test.date).valueOf(), "nextOpen test " + i + ": " + test.outcome.valueOf() + " != " + Hours.nextOpen(test.hours, test.date).valueOf());
		}

	});

	it('intersects', function () {
		var tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);

		var cases = [
			{ start : new Date(), stop : tomorrow, hours : ["Su-Sa"], outcome : true },
			{ start : Hours.relativeDate("Mon", 0, 0), stop : Hours.relativeDate("Mon", 18,00), hours : ["Tu-Th"], outcome : false },
			{ start : new Date("Sat Jan 03 2015 00:00:00 GMT-0500 (EST)"),
				stop : new Date("Sat Jan 03 2015 23:59:59 GMT-0500 (EST)"), 
				hours : ["Tu 7:30-20:00", "We 7:30-20:00", "Th 7:30-20:00", "Fr 7:30-20:00", "Sa 8:30-21:00", "Su 8:30-21:00"], 
				outcome : true
			},
			{ start : new Date("Sat Jan 03 2015 00:00:00 GMT-0500 (EST)"),
				stop : new Date("Sat Jan 03 2015 23:59:59 GMT-0500 (EST)"), 
				hours : ["Tu-Sa 7:30-20:00"], 
				outcome : true
			}
		];

		for (var i=0, testCase; testCase= cases[i]; i++) {
			var outcome = testCase.outcome
				, start = testCase.start
				, stop = testCase.stop
				, hours = testCase.hours;

			assert.equal(outcome, Hours.intersects(start, stop, hours), "intersets test case " + i + " : " + outcome + " != " + Hours.intersects(start, stop, hours));
		}
	});

	it('toString', function () {
		var cases = {
			"Thursday-Saturday, 9:00am-5:00pm" : ["Th-Sa 9:00-17:00"]
		}

		for (var outcome in cases) {
			hours = cases[outcome];
			assert.equal(outcome, Hours.toString(hours), "toString fail: " + outcome + " : " + outcome + " != " + Hours.toString(hours));
		}
	});

	it("openingObject", function () {
		var cases = {
			"Mo-Fr" : { Su : false, Mo : true, Tu : true, We : true, Th : true, Fr : true, Sa : false, allDay : true, startHr : 0, startMin : 0, stopHr : 23, stopMin : 59 },
			"Mo-Fr 9:00-17:00" : { Su : false, Mo : true, Tu : true, We : true, Th : true, Fr : true, Sa : false, allDay : false, startHr : 9, startMin : 0, stopHr : 17, stopMin : 0 }
		};

		for (var input in cases) {
			var outcome = cases[input]
				, test = Hours.openingObject(input);

			for (var key in test) {
				assert.equal(test[key], outcome[key], "openingObject fail: " + input + " : " + key + " : " + outcome[key] + " != " + test[key]  );
			}
		}
	});

	it("openingObjectToString", function () {
		var cases = {
			"Mo-Fr" : { Su : false, Mo : true, Tu : true, We : true, Th : true, Fr : true, Sa : false, allDay : true, startHr : 0, startMin : 0, stopHr : 23, stopMin : 59 },
			"Mo-Fr 9:00-17:00" : { Su : false, Mo : true, Tu : true, We : true, Th : true, Fr : true, Sa : false, allDay : false, startHr : 9, startMin : 0, stopHr : 17, stopMin : 0 },
			"Mo,We-Sa 10:47-22:11" : { Su : false, Mo : true, Tu : false, We : true, Th : true, Fr : true, Sa : true, allDay : false, startHr : 10, startMin : 47, stopHr : 22, stopMin : 11 },
			"Mo,We,Fr-Sa 10:47-22:11" : { Su : false, Mo : true, Tu : false, We : true, Th : false, Fr : true, Sa : true, allDay : false, startHr : 10, startMin : 47, stopHr : 22, stopMin : 11 }
		}

		for (var outcome in cases) {
			var input = cases[outcome]
				, result = Hours.openingObjectToString(input);

			assert.equal(result, outcome, "openingObjectToString fail: " + result + " != " + outcome);
		}
	});
});