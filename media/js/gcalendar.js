// Require:
// jQuery
// jQuery UI Draggable, Droppable
// gCalendar.Time.js

function gCalendar(param) {
    var _this = this,
        today = new Date(),
        i;

    this._data = [];

    // все dom элементы
    this._html = {};

    // дни в календаре
    this._days = {};

    if (typeof param === 'object') {
        if (param.parent) {
            this._html.parent = $(param.parent);
        }

        // временной интервал, по которому делится день на элементы
        this._timeInterval = param.timeInterval || 15;

        // границы дня, например от 8:00 до 16:00
        this._timeBounds = {};
        if (param.timeBounds) {
            if (typeof param.timeBounds.start !== 'undefined') {
                this._timeBounds.start = new gCalendar.Time(param.timeBounds.start);
            } else {
                this._timeBounds.start = new gCalendar.Time(0, 0);
            }
            if (typeof param.timeBounds.end !== 'undefined') {
                this._timeBounds.end = new gCalendar.Time(param.timeBounds.end);
            } else {
                this._timeBounds.end = new gCalendar.Time(23, 59);
            }
        } else {
            this._timeBounds.start = new gCalendar.Time(0, 0);
            this._timeBounds.end = new gCalendar.Time(23, 59);
        }

        // количество дней в ширине календаря
        this._daysLength = param.daysLength || 3;

        // первый день календаря
        if (param.firstDay instanceof Date) {
            this._days.first = new Date(param.firstDay.getFullYear(), param.firstDay.getMonth(), param.firstDay.getDate());
        } else {
            this._days.first = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        }
    }

    // счетчик дней (увеличивается дата)
    this._countDateDay = (function() {
        var count = new Date(_this._days.first);
        return function() {
                var t = new Date(count);
                count.setDate(count.getDate() + 1);
                return t;
            };
    })();

    // все интервалы в календаре
    this._allIntervals = {};

    // количество временных интервалов в дне календаря
    this._intervalLength = Math.ceil(this._timeBounds.start.getDifferenceWith(this._timeBounds.end).getFullMinutes() / this._timeInterval);

    // все мероприятия каледаря
    this.allActions = {};

    this._UIInit();

    this._draw();
};

gCalendar.prototype._countIdDay = (function() {
    var count = 0;
    return function() {
            return count++;
        };
})();

gCalendar.prototype._countIdInterval = (function() {
    var count = 0;
    return function() {
            return count++;
        };
})();

gCalendar.prototype._UIInit = function() {
    var i, j, s;

    this._days.html = $('<table><tbody><tr></tr></tbody></table>', {'class': 'gcalendar-tabledays'});
    this._days.htmlTr = this._days.html.find('tr');

    this._UIInitDays();
};

gCalendar.prototype._UIInitDays = function() {
    var _this = this,
        i;

    this._days.array = {};


    for (i = 0; i < this._daysLength; i++) {
        this._UIInitOneDay();
    }
};

gCalendar.prototype._UIInitOneDay = function() {
    var day = {},
        i;

    day.id = this._countIdDay();
    day.html = $('<td />', {'class': 'gcalendar-day'});
    day.date = this._countDateDay();

    day.intervals = {};

    for (i = 0; i < this._intervalLength; i++) {
        this._UIInitOneInterval(day);
    }

    day.firstIntervalNumber = Number(Object.keys(day.intervals)[0]);

    this._days.array[day.id] = day;
    this._days.htmlTr.append(day.html);

    // TODO: Убрать!
    day.html.click(function(ev) {
        console.log(day);
    });
};

gCalendar.prototype._UIInitOneInterval = function(day) {
    var interval = {};

    interval.id = this._countIdInterval();
    interval.html = $('<div />', {'class': 'gcalendar-interval'});
    interval.day = day;

    // добавить интервал в список всех интервалов календаря
    this._allIntervals[interval.id] = interval;

    // добавить интервал в список интервалов дня
    day.intervals[interval.id] = interval;
    day.html.append(interval.html);
};

/*gCalendar.prototype.setData = function(data) {
    var i;

    if (data instanceof Array) {
        for (i = 0; i < data.length; i++) {
            this._initItem(data[i]);
        }
    }

    this._draw();
};

gCalendar.prototype._initItem = function(itemData) {
    var item = {};

    item.start = itemData.start || new Date();
    item.duration = itemData.duration || this._timeInterval;

    // длительность и время начала элементов только кратная timeInterval
    item.duration = Math.ceil(item.duration / this._timeInterval) * this._timeInterval;
    item.start.setMinutes(Math.floor(item.start.getMinutes() / this._timeInterval) * this._timeInterval);

    this._data.push(item);
};*/

gCalendar.prototype._draw = function() {
    var i;

    this._html.parent.empty();

    // прорисовка дней с интервалами
    this._html.parent.append(this._days.html);
};

gCalendar.prototype.addAction = function(param) {
    var action = new gCalendar.Action(param);

    action.addTo(this);

    return action;
};

gCalendar.prototype.getDays = function() {
    return this.days;
};