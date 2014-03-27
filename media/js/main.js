var cal, action1, action2, action3;

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
        },
        firstDay: new Date(2014, 02, 25)
    });

    action1 = cal.addAction({
        dateStart: new Date(2014, 02, 26, 9, 5),
        duration: 55
    });

    action2 = cal.addAction({
        dateStart: new Date(2014, 02, 26, 10, 32),
        duration: 115
    });


    action3 = cal.addAction({
        dateStart: new Date(2014, 02, 25, 10, 00),
        duration: 15
    });


});