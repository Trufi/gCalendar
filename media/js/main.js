var cal, action1, action2, action3, action4;

var cal2, a1, a2;

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
        firstDay: new Date(2014, 02, 25),
        daysLength: 5,
        maxScroll: 45
    });

    action1 = cal.addAction({
        dateStart: new Date(2014, 02, 26, 9, 5),
        duration: 55,
        html: '+7 999 999 9999<br/>SibAcadem'
    });

    action2 = cal.addAction({
        dateStart: new Date(2014, 02, 26, 10, 32),
        duration: 115,
        addClass: 'busy',
        html: '+7 999 999 9999<br/>SibAcadem'
    });

    action3 = cal.addAction({
        dateStart: new Date(2014, 02, 25, 10, 00),
        duration: 25,
        onClick: function() {
            alert('click!');
        },
        html: '+7 999 999 9999<br/>SibAcadem'
    });

    action4 = cal.addAction({
        dateStart: new Date(2014, 02, 30, 14, 00),
        duration: 25,
        html: '+7 999 999 9999<br/>SibAcadem'
    });

    cal.addAction({
        dateStart: new Date(2014, 02, 25, 14, 30),
        duration: 58,
        addClass: 'admin',
        html: '+7 999 999 9999<br/>SibAcadem'
    });
    cal.addAction({
        dateStart: new Date(2014, 02, 27, 11, 30),
        duration: 120,
        addClass: 'admin',
        html: '+7 999 999 9999<br/>SibAcadem'
    });
    cal.addAction({
        dateStart: new Date(2014, 02, 28, 11, 00),
        duration: 90,
        html: '+7 999 999 9999<br/>SibAcadem'
    });
    cal.addAction({
        dateStart: new Date(2014, 02, 29, 8, 00),
        duration: 120,
        addClass: 'busy',
        html: '+7 999 999 9999<br/>SibAcadem'
    });
});