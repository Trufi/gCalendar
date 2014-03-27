// Require:
// none!

if (typeof gCalendar === 'undefined') {
    gCalendar = {};
}

// класс времени
gCalendar.Time = function(param, param2) {
    var time;

    if (typeof param2 === 'undefined') {
        if (typeof param === 'string') {
            time = param.split(':');
            if (time.length === 2 || time.length === 3) {
                this._hour = Math.max(Math.min(parseInt(time[0], 10), 23), 0);
                this._minute = Math.max(Math.min(parseInt(time[1], 10), 59), 0);
            } else if (time.length === 1) {
                time = parseInt(time[0], 10);
                if (time !== NaN) {
                    this.setFullMinutes(time);
                } else {
                    this._reset();
                }
            } else {
                this._reset();
            }
        } else if (param instanceof Date || param instanceof gCalendar.Time) {
            this._hour = param.getHours();
            this._minute = param.getMinutes();
        } else if (typeof param === 'number') {
            this.setFullMinutes(param);
        } else {
            this._reset();
        }
    } else {
        if (typeof param === 'number' && typeof param2 === 'number') {
            this._hour = Math.max(Math.min(parseInt(param, 10), 23), 0);
            this._minute = Math.max(Math.min(parseInt(param2, 10), 59), 0);
        } else {
            this._reset();
        }
    }
};

gCalendar.Time.prototype._reset = function() {
    this._hour = 0;
    this._minute = 0;

    return this;
};

gCalendar.Time.prototype.getHours = function() {
    return this._hour;
};

gCalendar.Time.prototype.getMinutes = function() {
    return this._minute;
};

gCalendar.Time.prototype.setHours = function(hour) {
    hour = parseInt(hour, 10);

    if (hour !== NaN) {
        this._hour = Math.max(Math.min(hour, 23), 0);
    }

    return this;
};

gCalendar.Time.prototype.setMinutes = function(minute) {
    minute = parseInt(minute, 10);

    if (minute !== NaN) {
        this._minute = Math.max(Math.min(minute, 59), 0);
    } else {
        return false;
    }

    return this;
};

gCalendar.Time.prototype.getFullMinutes = function() {
    return this.getHours() * 60 + this.getMinutes();
};

gCalendar.Time.prototype.setFullMinutes = function(minute) {
    var hour;

    minute = parseInt(minute, 10);

    if (minute !== NaN) {
        minute = Math.abs(minute);
        hour = Math.floor(minute / 60);
        minute = minute - hour * 60;
    } else {
        return false;
    }

    this._hour = hour;
    this._minute = minute;

    return this;
};

gCalendar.Time.prototype.getDifferenceWith = function(antime) {
    var a, b;

    if (antime instanceof gCalendar.Time) {
        a = this.getFullMinutes();
        b = antime.getFullMinutes();

        return Math.abs(b - a);
    } else {
        return false;
    }
};

gCalendar.Time.prototype.isEqual = function(antime) {
    var a, b;

    if (antime instanceof gCalendar.Time) {
        a = this.getFullMinutes();
        b = antime.getFullMinutes();

        return (a === b);
    } else {
        return false;
    }
};

gCalendar.Time.prototype.getString = function(symb) {
    var c, hour, minute;

    if (typeof symb === 'string') {
        c = symb;
    } else {
        c = ':';
    }

    hour = ('0' + this.getHours()).slice(-2);
    minute = ('0' + this.getMinutes()).slice(-2);

    return hour + c + minute;
};