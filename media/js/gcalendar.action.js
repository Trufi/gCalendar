// Require:
// gcalendar.js
// gcalendar.time.js

gCalendar.prototype.addAction = function(param) {
    var action = new gCalendar.Action(param);

    action.addTo(this);

    return action;
};

gCalendar._countIdAction = (function() {
    var count = 0;
    return function() {
            return count++;
        };
})();

// gCalendar._isChrome = navigator.userAgent.indexOf('Chrome') !== -1;

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

    return Math.floor((bTime - aTime) / 86400000);
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
            this._noDateStart = true;
        }

        if (typeof param.onClick === 'function') {
            this.onClick = param.onClick;
        } else {
            this.onClick = function() {};
        }

        if (typeof param.onChange === 'function') {
            this.onChange = param.onChange;
        } else {
            this.onChange = function() {};
        }

        this._addClass = param.addClass || '';
        this._html = param.html || '';

        // можно ли перемещать мероприятие
        if (typeof param.draggable !== 'undefined') {
            this._isDraggable = param.draggable;
        } else {
            this._isDraggable = true;
        }

        this._data = param.data || {};
    } else {
        this._dateStart = new Date();
        this._duration = 0;
        this._addClass = '';
        this._html = '';
        this._data = {};
    }

    this._html = $(this._html);
    this._duration = Math.abs(this._duration);
    this._timeStart = new gCalendar.Time(this._dateStart);
    this._dateStart = new Date(this._dateStart.getFullYear(), this._dateStart.getMonth(), this._dateStart.getDate());
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
    var days = this._calendar._visibleDays,
        diff, date, i;

    // сколько интервалов займет мероприятие
    this._numberIntervals = Math.ceil(this._duration / this._calendar._timeInterval);

    // если у мероприятия была указана дата и вермя старта
    if (!this._noDateStart) {
        // отсчёт дней в любом календаре начинается с 0
        diff = gCalendar.diffDates(days.array[days.firstDayNumber].date, this._dateStart);

        // проверка на первый и на последний день
        if ((diff >= this._calendar._scroll.min) && (typeof days.array[days.firstDayNumber + diff] !== 'undefined')) {
            // наш день - это
            this._calDay = days.array[days.firstDayNumber + diff];

            // найдём начальный интервал
            diff = Math.floor((this._timeStart.getFullMinutes() - this._calDay.intervals[this._calDay.firstIntervalNumber].time.getFullMinutes()) / this._calendar._timeInterval);

            // проверка на первый и на последний интервал в дне
            if ((diff >= this._calendar._scroll.min) && (typeof this._calDay.intervals[this._calDay.firstIntervalNumber + diff + this._numberIntervals - 1] !== 'undefined')) {
                this._calFirstInterval = this._calDay.intervals[this._calDay.firstIntervalNumber + diff];
                this._calendarIntervalsBusy(); // <------
            } else {
                console.log('время мероприятия не попадает в заданные границы дня');
            }
        } else if ((diff >= this._calendar._scroll.min) && (days.firstDayNumber + diff < this._calendar._scroll.max)) {
            this._calendar._addToQueue(days.firstDayNumber + diff, this);
        } else {
            console.log('дата мероприятия не попадает в заданные дни');
        }
    } else {
        // поместим меропрятие сразу в freeArea
        this._initFreeArea();
    }
};

gCalendar.Action.prototype._calendarIntervalsBusy = function() {
    var isBusy = false,
        i;

    for (i = 0; i < this._numberIntervals; i++) {
        if (typeof this._calDay.intervals[i + this._calFirstInterval.id].actionId !== 'undefined') {
            isBusy = true;
            break;
        }
    }

    if (!isBusy) {
        this._calendarIntervalsHtmlBusy();
    } else {
        console.log('Время для мероприятия занято!');
    }
};

gCalendar.Action.prototype._calendarIntervalsHtmlBusy = function() {
    var _this = this,
        i, el;

    this._intervals = {};
    this._wrapIntervals = $('<div />', {'class': 'gcalendar-wrapintervals'});

    for (i = 0; i < this._numberIntervals; i++) {
        el = this._calDay.intervals[i + this._calFirstInterval.id];

        el.actionId = this.id;
        this._intervals[i + this._calFirstInterval.id] = el;
    }

    this._calFirstInterval.html.append(this._wrapIntervals);

    this._wrapIntervals
        .addClass(this._addClass)
        .append(this._html)
        .css({
            width: this._calendar._html.intervalSize.width - 5,
            height: this._calendar._html.intervalSize.height * this._numberIntervals - 5
        })
        .on('click', function() {
                _this.onClick();
            });

    if (this._isDraggable) {
        this._wrapIntervals.draggable({
            opacity: 0.3,
            revert: false,
            cursorAt: {top: 5, left: 35},
            start: this._initDroppable.bind(this),
            stop: this._stopDroppable.bind(this),
            zIndex: 15,
            scroll: true,
            helper: 'clone',
            appendTo: this._calendar._html.main/*,
            drag: function(ev, ui) {
                // фикс позиции клона в браузерах, кроме хрома
                if (!gCalendar._isChrome) {
                    ui.position.top -= $(document).scrollTop();
                    ui.position.left -= $(document).scrollLeft();
                }
            }*/

            // TODO: Разобраться с багом!
        })
    } else {
        this._wrapIntervals.addClass('gcalendar-notdraggable');
    }
};

gCalendar.Action.prototype._calendarIntervalsHtmlFree = function() {
    var setOfIntervals = $(),
        i;

    for (i in this._intervals) {
        setOfIntervals = setOfIntervals.add(this._intervals[i].html);
        delete this._intervals[i].actionId;
    }

    setOfIntervals.unwrap();

    delete this._wrapIntervals;
    delete this._intervals;

    return this;
};

gCalendar.Action.prototype._initFreeArea = function() {
    var isBusyFreeArea = true,
        i;

    this._calDay = this._calendar._freeArea;

    for (i = 0; i < this._calendar._intervalLength; i++) {
        if (this._intervalCheckBusy(this._calDay.intervals[this._calDay.firstIntervalNumber + i])) {
            this._calFirstInterval = this._calDay.intervals[this._calDay.firstIntervalNumber + i];
            this._calendarIntervalsHtmlBusy();
            return true;
        }
    }

    if (isBusyFreeArea) {
        console.log('freeArea полностью занята');
    }
};

gCalendar.Action.prototype._intervalCheckBusy = function(interval) {
    var i;

    for (i = 0; i < this._numberIntervals; i++) {
        // либо его нет в дне, либо он занят
        if ((typeof this._calDay.intervals[interval.id + i] ==='undefined') || (typeof this._calDay.intervals[interval.id + i].actionId !== 'undefined')) {
            return false;
        }
    }

    return true;
};

// пробегает все интервалы в календаре, делает их droppable, если хватает места для текущего draggable элемента
gCalendar.Action.prototype._initDroppable = function() {
    var daysArr, intArr, i, j, el;


    this._wrapIntervals.addClass('gcalendar-wrapintervals-draggable');

    daysArr = this._calendar._visibleDays.array;
    for (i in daysArr) {
        intArr = daysArr[i].intervals;
        for (j in intArr) {
            this._initIntervalDroppable(intArr[j]);
        }
    }

    // плюс делаем droppable все интервалы этого мероприятия, кроме первого
    this._initSelfDroppable();

    // плюс делаем droppable все интервалы freeArea
    this._initFreeAreaDroppable();
};

gCalendar.Action.prototype._initIntervalDroppable = function(interval) {
    var _this = this,
        isFail = false,
        intervalsInDay = interval.day.intervals,
        i;

    for (i = 0; i < this._numberIntervals; i++) {
        if ((typeof intervalsInDay[i + interval.id] === 'undefined') || (typeof intervalsInDay[i + interval.id].actionId !== 'undefined')) {
            isFail = true;
            break;
        }
    }

    if (!isFail) {
        this._startDroppable(interval);
    }
};

gCalendar.Action.prototype._initSelfDroppable = function() {
    var intervalsInDay = this._calDay.intervals,
        firstIntervalNumber = this._calFirstInterval.id,
        i, el, id;

    // первый интервал не droppable
    // идём вниз
    for (i = 1; i < this._numberIntervals; i++) {
        id = i + firstIntervalNumber + this._numberIntervals - 1;

        if ((typeof intervalsInDay[id] === 'undefined') || (typeof intervalsInDay[id].actionId !== 'undefined')) {
            break;
        } else {
            this._startDroppable(intervalsInDay[i + firstIntervalNumber]);
        }
    }

    // идём наверх
    for (i = 1; i < this._numberIntervals; i++) {
        id = firstIntervalNumber - i;

        if ((typeof intervalsInDay[id] === 'undefined') || (typeof intervalsInDay[id].actionId !== 'undefined')) {
            break;
        } else {
            this._startDroppable(intervalsInDay[id]);
        }
    }
};

gCalendar.Action.prototype._initFreeAreaDroppable = function() {
    var freeAreaIntervals = this._calendar._freeArea.intervals,
        i;

    for (i in freeAreaIntervals) {
        this._initIntervalDroppable(freeAreaIntervals[i]);
    }

    //this._freeArea.html
};

gCalendar.Action.prototype._startDroppable = function(interval) {
    interval.isDroppable = true;
    interval.html
        .droppable({
            tolerance: 'pointer',
            drop: this._intervalOnDrop.bind(this, interval)
        });
};

// делает все интервалы в календаре не droppable
gCalendar.Action.prototype._stopDroppable = function() {
    var daysArr, intArr, i, j;

    this._wrapIntervals.removeClass('gcalendar-wrapintervals-draggable');

    daysArr = this._calendar._visibleDays.array;
    for (i in daysArr) {
        intArr = daysArr[i].intervals;
        for (j in intArr) {
            if (intArr[j].isDroppable) {
                intArr[j].html.droppable('destroy');
                intArr[j].isDroppable = false;
            }
        }
    }

    // плюс интервалы в freeArea
    intArr = this._calendar._freeArea.intervals;
    for (j in intArr) {
        if (intArr[j].isDroppable) {
            intArr[j].html.droppable('destroy');
            intArr[j].isDroppable = false;
        }
    }
};

gCalendar.Action.prototype._intervalOnDrop = function(interval) {
    var i;

    this._wrapIntervals.detach();
    this._stopDroppable();

    for (i in this._intervals) {
        delete this._intervals[i].actionId;
    }

    if (!interval.isInFreeArea) {
        this._dateStart.setFullYear(interval.day.date.getFullYear());
        this._dateStart.setMonth(interval.day.date.getMonth());
        this._dateStart.setDate(interval.day.date.getDate());

        this._timeStart
            .setHours(interval.time.getHours())
            .setMinutes(interval.time.getMinutes());
    }

    this._calDay = interval.day;
    this._calFirstInterval = interval;
    this._calendarIntervalsBusy();

    if (!interval.isInFreeArea) {
        this.onChange(this);
    }
};

/*gCalendar.Action.prototype.getHtml = function() {
    return this._html;
};*/

gCalendar.Action.prototype.setHtml = function(html) {
    this._wrapIntervals
        .empty()
        .append(html);

    return this;
};

gCalendar.Action.prototype.getData = function() {
    return this._data;
};

gCalendar.Action.prototype.getDateStart = function() {
    var date = new Date(this._dateStart);

    date.setHours(this._timeStart.getHours());
    date.setMinutes(this._timeStart.getMinutes());

    return date;
};