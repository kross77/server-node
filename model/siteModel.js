//siteModel.js
var crypto = require('crypto');

/**
 * Структура представлена в бд в виде:
 * (hashes) sites:<hash>: {
*                            url: <url>
*                            lastTime: <time>
*                         }
 * (set)     sites:set: <hash>
 */


// model for sites

var SiteModel = module.exports =
    function(client) {
        this.client = client;
        this.isCreate = false;
    };


//function Factory
SiteModel.prototype.create =
    function(url, time) {
        var site = new SiteModel(this.client);
        site.url = url;
        site.time = time || new Date().getTime();
        site.isCreate = true;
        return site;
    };

SiteModel.prototype.__defineGetter__('hash', function () {
    return this.getHash(this.url);
});

// Функция возвращает md5 хеш
SiteModel.prototype.getHash = function (url) {
    return crypto.createHash('md5').update((url || this.url)).digest('hex');;
};


// Префиксы
SiteModel._prefix_ = 'sites:';

// Возвращает имя ключа для Hashes
SiteModel.prototype.pHashes = function (url) {
    return SiteModel._prefix_ + this.getHash(url) + ':';
};

// Возвращает имя поля для URL
SiteModel.prototype.kUrl = function () {
    return 'url:';
};

// Возвращает имя поля для времени последнего входа
SiteModel.prototype.kLastTime = function () {
    return 'lastTime:';
};

// Возвращает имя ключа для Set
SiteModel.prototype.pSet = function () {
    return SiteModel._prefix_ + 'set:';
};

//SiteModel.save();
SiteModel.prototype.save = function (callback) {
    // проверяем была ли создана модель через .create()
    if (this.isCreate) {
        this._save.call(this, callback);
    } else {
        if (callback) callback.call(this, new Error('Модель должна быть создана перед сохранением'), null, this);
    };
};


// Основная функция выполняющая сохранение
SiteModel.prototype._save = function (callback) {
    // Сохраняем все в один запрос
    this.client.multi([
            ['hmset', this.pHashes(), this.kUrl(), this.url, this.kLastTime(), this.time],
            ['sadd', this.pSet(), this.hash]
        ]).exec(function (err, repl) {
            if (err) {
                if (callback) callback.call(this, err, null, this);
            } else {
                if (callback) callback.call(this, null, repl, this);
            };
        }.bind(this));
};
////

// SiteModel.remove()
SiteModel.prototype.remove = function (url, callback) {
    //  Если аргумент 1, то это callback
    if (arguments.length == 1) {
        var callback = arguments[0];
        url = undefined;
    };

    this.client.multi([
            ['del', this.pHashes(url)],
            ['srem', this.pSet(), this.hash]
        ]).exec(function (err, repl) {
            if (err) {
                if (callback) callback.call(this, err, null, this);
            } else {
                if (callback) callback.call(this, null, repl, this);
            };
        }.bind(this));
};
////

// SiteModel.findByUrl
SiteModel.prototype.findByUrl = function (url, callback) {
    // Конструрируем запрос
    var q = [this.pHashes(url), this.kUrl(), this.kLastTime()];

    this.client.hmget(q, function(err, repl) {
        if (err) {
            if (callback) callback.call(this, err, null, this);
        } else if (repl) {
            var res = this.create(repl[0], repl[1]);

            if (callback) callback.call(this, null, res, this);
        } else {
            if (callback) callback.call(this, null, null, this);
        };
    }.bind(this));
};
/////






