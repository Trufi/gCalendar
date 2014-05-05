var cal, action1, action2, action3, action4, action5;

var cal2, a1, a2;

$(function() {
    cal = new gCalendar({
        timeInterval: 15,
        parent: $('#calendar-wrap'),
        timeBounds: {
            start: new gCalendar.Time(08, 00),
            end: new gCalendar.Time(16, 00)
        },
        firstDay: new Date(2014, 02, 25),
        daysLength: 5,
        maxScroll: 45,
        freeArea: $('#area-wrap')
    });

    action1 = cal.addAction({
        dateStart: new Date(2014, 02, 26, 9, 5),
        duration: 55,
        html: 'Disable draggable',
        draggable: false
    });

    action2 = cal.addAction({
        dateStart: new Date(2014, 02, 26, 10, 32),
        duration: 115,
        addClass: 'busy',
        html: '<div>ElementOnChange</div>',
        onChange: function() {
            alert('change!');
        }
    });

    action3 = cal.addAction({
        dateStart: new Date(2014, 02, 25, 10, 00),
        duration: 15,
        html: 'ElementOnClick',
        onClick: function() {
            alert('click!');
        }
    });

    action4 = cal.addAction({
        dateStart: new Date(2014, 02, 30, 14, 00),
        duration: 25
    });

    action5 = cal.addAction({
        dateStart: new Date(2014, 02, 29, 15, 30),
        duration: 30
    });

    cal.addAction({
        duration: 150
    });

    cal.addAction({
        duration: 100,
        addClass: 'busy'
    });


    cal2 = new gCalendar({
        timeInterval: 30,
        parent: $('#calendar-wrap2'),
        timeBounds: {
            start: new gCalendar.Time(12, 00),
            end: new gCalendar.Time(20, 00)
        },
        firstDay: new Date(2014, 02, 25),
        daysLength: 10,
        maxScroll: 5
    });

    a1 = cal2.addAction({
        dateStart: new Date(2014, 02, 30, 14, 00),
        duration: 50
    });

    a2 = cal2.addAction({
        dateStart: new Date(2014, 02, 26, 12, 00),
        duration: 350
    });
});