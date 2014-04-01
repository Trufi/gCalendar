// Require:
// jQuery
// jQuery UI Draggable, Droppable
// gCalendar.Time.js
// gCalendar.css

function gCalendar(param) {
    var _this = this,
        i;

    this._data = [];

    // все dom элементы
    this._html = {
        buttonsLeft: [],
        buttonsRight: []
    };

    // scroll
    this._scroll = {
        index: 0,
        min: 0,
        activeDays: 0,
        duration: 200
    };

    this._queue = {};

    // дни в календаре
    this._days = {};

    this._freeArea = {};

    this._countIdQueueItem = (function() {
        var count = 0;
        return function() {
                return count++;
            };
    })();

    this._countIdDay = (function() {
        var count = 0;
        return function() {
                return count++;
            };
    })();

    this._countIdInterval = (function() {
        var count = 0;
        return function() {
                return count++;
            };
    })();

    if (typeof param === 'object') {
        if (param.parent) {
            this._html.parent = $(param.parent);
        }

        if (param.freeArea) {
            this._freeArea.parent = $(param.freeArea);
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

        // максимальное количество дней в календаре при скролле
        this._scroll.max = param.maxScroll || 60;

        // первый день календаря
        if (param.firstDay instanceof Date) {
            this._days.first = new Date(param.firstDay);
        } else {
            this._days.first = new Date();
        }
        this._days.first = new Date(this._days.first.getFullYear(), this._days.first.getMonth(), this._days.first.getDate());
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
    this._intervalLength = Math.ceil(this._timeBounds.start.getDifferenceWith(this._timeBounds.end) / this._timeInterval);

    // все мероприятия каледаря
    this.allActions = {};

    this._UIInit();

    this._draw();
};

gCalendar.prototype._UIInit = function() {
    this._html.main = $('<div />', {'class': 'gcalendar gcalendar-clearfix'});

    this._html.parent.empty();
    this._html.parent.append(this._html.main);

    // инициализируем левые подписи
    this._UIInitLeftColumn();
    // получаем _html.leftColumn.table
    this._html.main.append(this._html.leftColumn.table);

    // инициализируем дни и интервалы со слайдером
    this._UIInitDays();
    // получаем _html.moveArea

    // инициализируем правую колонку
    this._UIInitRightColumn();


    // append html
    this._html.main.append(this._html.rightColumn.table);

    // freeArea для перемещение дней за границы недели
    this._UIInitFreeArea();
};

gCalendar.prototype._UIInitFreeArea = function() {
    var i;

    this._freeArea.html = $('<div />', {'class': 'gcalendar-day gcalendar-freearea'});
    this._freeArea.intervals = {};

    for (i = 0; i < this._intervalLength; i++) {
        (function() {
            var el = {};

            el.html = $('<div />', {'class': 'gcalendar-interval'});

            if (i === this._intervalLength - 1) {
                el.html.addClass('gcalendar-interval-last');
            }

            el.id = this._countIdInterval();
            el.day = this._freeArea;
            el.isInFreeArea = true;

            this._freeArea.intervals[el.id] = el;
            this._freeArea.html.append(el.html);
        }).apply(this);
    }

    this._freeArea.firstIntervalNumber = Number(Object.keys(this._freeArea.intervals)[0]);

    if (typeof this._freeArea.parent !== 'undefined') {
        this._freeArea.parent.append(this._freeArea.html);
    }
};

gCalendar.prototype._UIInitDays = function() {
    var i;

    this._html.moveArea = $('<div />', {'class': 'gcalendar-movearea'});
    this._html.moveAreaInner = $('<div />', {'class': 'gcalendar-movearea-inner'});
    this._html.moveArea.append(this._html.moveAreaInner);
    this._html.main.append(this._html.moveArea);

    this._days.html = $('<table><thead><tr class="gcalendar-desc-top"></tr></thead><tbody><tr></tr></tbody></table>', {'class': 'gcalendar-tabledays'});
    this._days.htmlThead = this._days.html.find('thead tr');
    this._days.htmlTbody = this._days.html.find('tbody tr');
    this._html.moveAreaInner.append(this._days.html);

    this._days.array = {};

    for (i = 0; i < this._daysLength; i++) {
        this._UIInitOneDay();
    }

    this._days.firstDayNumber = Number(Object.keys(this._days.array)[0]);

    this._html.intervalSize = {
        width: this._allIntervals[0].html.outerWidth(),
        height: this._allIntervals[0].html.outerHeight()
    };

    this._html.moveArea.css({
        width: this._html.intervalSize.width * this._daysLength - 1
    });
};

gCalendar.prototype._UIInitOneDay = function() {
    var day = {},
        i;

    day.id = this._countIdDay();
    day.html = $('<td />', {'class': 'gcalendar-day'});
    day.date = this._countDateDay();

    day.intervals = {};

    this._UIInitDescDay(day, i);
    for (i = 0; i < this._intervalLength; i++) {
        this._UIInitOneInterval(day, i);
    }

    day.firstIntervalNumber = Number(Object.keys(day.intervals)[0]);

    this._days.array[day.id] = day;
    this._days.htmlTbody.append(day.html);
    this._days.htmlThead.append(day.htmlDesc);

    /*
    day.html.click(function(ev) {
        console.log(day);
    });*/
};

gCalendar.prototype._UIInitDescDay = function(day, i) {
    var dateDay = ('0' + day.date.getDate()).slice(-2),
        dateMonth = ('0' + (day.date.getMonth() + 1)).slice(-2),
        dayStrArray = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    day.htmlDesc = '<th><div class="gcalendar-interval">' + dateDay + '.' + dateMonth + ', ' + dayStrArray[day.date.getDay()] + '</div></th>';
};

gCalendar.prototype._UIInitOneInterval = function(day, i) {
    var interval = {};

    interval.id = this._countIdInterval();
    interval.html = $('<div />', {'class': 'gcalendar-interval'});
    interval.day = day;
    interval.time = new gCalendar.Time(this._timeBounds.start.getFullMinutes() + i * this._timeInterval);

    // добавить интервал в список всех интервалов календаря
    this._allIntervals[interval.id] = interval;

    // если четный интервал
    if (i % 2 === 1) {
        interval.html.addClass('gcalendar-interval-spec');
    }

    // если интервал последний в дне добавим соотв-щий класс
    if (i === this._intervalLength - 1) {
        interval.html.addClass('gcalendar-interval-last');
    }

    // добавить интервал в список интервалов дня
    day.intervals[interval.id] = interval;
    day.html.append(interval.html);

    /*
    interval.html.html(interval.time.getString() + ' - ' + interval.id);
    interval.html.click(function(ev) {
        console.log(interval);
    });*/
};

gCalendar.prototype._UIInitLeftColumn = function() {
    this._html.leftColumn = {};

    this._html.leftColumn.table = $(
        '<table class="gcalendar-column-left">' +
            '<thead>' +
                '<tr class="gcalendar-desc-top">' +
                    '<th>' +
                        '<div class="gcalendar-interval">&nbsp;</div>' +
                    '</th>' +
                '</tr>' +
            '</thead>' +
            '<tbody>' +
                '<tr>' +
                    '<td></td>' +
                '</tr>' +
            '</tbody>' +
        '</table>'
    );

    this._html.leftColumn.thead = this._html.leftColumn.table.find('th div');
    this._html.leftColumn.tbody = this._html.leftColumn.table.find('td');

    this._html.leftColumn.tbody
        .addClass('gcalendar-desc-left')
        .html(this._UIInitDescInterval());

    this._UIAddLeftButton(this._html.leftColumn.thead);
};

gCalendar.prototype._UIInitRightColumn = function() {
    this._html.rightColumn = {};
    this._html.rightColumn.table  = $('<div />', {'class': 'gcalendar-column-right'});
    this._html.rightColumn.thead = $('<div />', {'class': 'gcalendar-interval'});

    this._html.rightColumn.table.append(this._html.rightColumn.thead);

    this._UIAddRightButton(this._html.rightColumn.thead);
};

gCalendar.prototype._UIInitDescInterval = function() {
    var html = '',
        cl, i, time;

    for (i = 0; i < this._intervalLength; i++) {
        cl = (i === this._intervalLength - 1) ? ' gcalendar-interval-last' : '';
        time = new gCalendar.Time(this._timeBounds.start.getFullMinutes() + i * this._timeInterval);

        if (i % 2 === 0) {
            html += '<div class="gcalendar-interval' + cl + '">' + time.getString() + '</div>';
        } else {
            html += '<div class="gcalendar-interval gcalendar-interval-spec' + cl + '"></div>';
        }
    }

    return html;
};

// Кнопки
gCalendar.prototype._UIAddLeftButton = function(parent) {
    var button = $('<div />', {'class': 'gcalendar-button gcalendar-button-left'});

    button.on('click', this._UIScrollLeft.bind(this));

    parent
        .empty()
        .append(button);

    this._html.buttonsLeft.push(button);
};

gCalendar.prototype._UIAddRightButton = function(parent) {
    var button = $('<div />', {'class': 'gcalendar-button gcalendar-button-right'});

    button.on('click', this._UIScrollRight.bind(this));

    parent
        .empty()
        .append(button);

    this._html.buttonsRight.push(button);
};

// Scroll
gCalendar.prototype._UIScrollLeft = function() {
    this._UIScroll(this._scroll.index - 1);
};

gCalendar.prototype._UIScrollRight = function() {
    this._UIScroll(this._scroll.index + 1);
};

gCalendar.prototype._UIScroll = function(newInd) {
    if ((newInd >= this._scroll.min) && (newInd <= this._scroll.max)) {
        if (newInd > this._scroll.activeDays) {
            this._UIInitOneDay();
            this._scroll.activeDays++;
        }

        this._html.moveAreaInner
            .stop(true, true)
            .animate({left: -newInd * this._html.intervalSize.width + 'px'}, this._scroll.duration);

        this._scroll.index = newInd;

        this._UIUpdateButtonStatus();

        this._updateVisibleDays();
    }
};

gCalendar.prototype._UIUpdateButtonStatus = function() {
    function disable(buttons) {
        var i;
        for (i = 0; i < buttons.length; i++) {
            buttons[i].addClass('gcalendar-button-disable');
        }
    };

    function enable(buttons) {
        var i;
        for (i = 0; i < buttons.length; i++) {
            buttons[i].removeClass('gcalendar-button-disable');
        }
    };

    if (this._scroll.index === this._scroll.min) {
        disable(this._html.buttonsLeft);
    } else if (this._scroll.index === this._scroll.min + 1) {
        enable(this._html.buttonsLeft);
    }

    if (this._scroll.index === this._scroll.max) {
        disable(this._html.buttonsRight);
    } else if (this._scroll.index === this._scroll.max - 1) {
        enable(this._html.buttonsRight);
    }
};

gCalendar.prototype._updateVisibleDays = function() {
    var day, i;

    this._visibleDays = {
        firstDayNumber: this._scroll.index,
        array: {}
    };

    for (i = 0; i < this._daysLength; i++) {
        day = this._days.array[this._scroll.index + i];
        this._visibleDays.array[day.id] = day;
    }

    this._checkQueue();
};

gCalendar.prototype._draw = function() {
    this._UIUpdateButtonStatus();
    this._updateVisibleDays();
};

// очередь не проинициализрованных элеметов, т.е. не в _visibleDays
gCalendar.prototype._addToQueue = function(dayId, item) {
    var id = this._countIdQueueItem();

    this._queue[id] = {id: id, dayId: dayId, item: item};
};

gCalendar.prototype._checkQueue = function() {
    var i;

    for (i in this._queue) {
        if (typeof this._visibleDays.array[this._queue[i].dayId] !== 'undefined') {
            this._queue[i].item._initCalendar();

            delete this._queue[i];
        }
    }
};

