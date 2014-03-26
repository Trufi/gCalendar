var cal;

$(function() {
    var dataArray = [
        {
            start: new Date(2014, 03, 29, 15, 5), // 15:00 29.03.2014
            duration: 25
        }, {
            start: new Date(2014, 03, 29, 12, 35), // 12:30 29.03.2014
            duration: 35
        }
    ];

    cal = new gCalendar({
        timeInterval: 15,
        parent: $('#calendar-wrap'),
        data: dataArray,
        timeBounds: {
            start: new gCalendar.Time(08, 00),
            end: new gCalendar.Time(16, 00)
        }
    });
});