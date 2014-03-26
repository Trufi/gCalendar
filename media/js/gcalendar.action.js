// Require:
// gcalendar.js

gCalendar._countIdAction = (function() {
    var count = 0;
    return function() {
            return count++;
        };
})();

// сравнивает две даты
gCalendar.equalDates = function(a, b) {
    return (a.getFullYear() === b.getFullYear()) && (a.getMonth() === b.getMonth()) && (a.getDate() === b.getDate());
};
// вычисляет разницу в днях между 2мя датами
gCalendar.diffDates = function(a, b) {
    var aDate = new Date(a.getFullYear(), a.getMonth(), a.getDate()),
        bDate = new Date(b.getFullYear(), b.getMonth(), b.getDate()),

        aTime = aDate.getTime(),
        bTime = bDate.getTime();

    return Math.round((bTime - aTime) / 86400000);
};

// класс мероприятий
gCalendar.Action = function(param) {
    this.id = gCalendar._countIdAction();

    if (typeof param === 'object') {
        this._duration = param.duration || 0;

        if (param.dateStart instanceof Date) {
            this._dateStart = new Date(param.dateStart);
        } else {
            this._dateStart = new Date();
        }
    } else {
        this._dateStart = new Date();
        this._duration = param.duration || 0;
    }
};

gCalendar.Action.prototype.addTo = function(calendar) {
    if (calendar instanceof gCalendar) {
        this._calendar = calendar;
        this._calendar.allActions[this.id] = this;

        this._initCalendar();
    }
};

// вычисляет, в каком дне и сколько интервалов занимает мероприятие
gCalendar.Action.prototype._initCalendar = function() {
    var days = this._calendar.getDays(),
        diff,
        date,
        k;

    diff = gCalendar.diffDates(days.first, this._dateStart);
    if (diff === 0) {
        // TODO: нашелся день мероприятия, осталось найти интервал; акциям добавить timeStart
    } else {
        date = new Date(days.first);
        date.setDate(date.getDate() + diff);

        // TODO: нашелся день мероприятия, осталось найти интервал; акциям добавить timeStart
    }
};