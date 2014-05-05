#gCalendar#


####[Demo](http://trufi.github.io/gCalendar)####

Init:

```javascript
    var calendar = new gCalendar({
        timeInterval: 15,
        parent: $('#parentElement'),
        timeBounds: {
            start: new gCalendar.Time(08, 00),
            end: new gCalendar.Time(16, 00)
        },
        firstDay: new Date(2014, 02, 25),
        daysLength: 5,
        maxScroll: 45,
        freeArea: $('#freeAreaElement')
    });
```
Add action:
```javascript
    var action = calendar.addAction({
        dateStart: new Date(2014, 02, 26, 10, 32),
        duration: 115,
        addClass: 'additionalClass',
        html: 'someHtml',
        onChange: function() {
            // change function
        },
        onClick: function() {
            // click function
        },
        draggable: true
    });
```