'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_moment2.default.locale('ja');
var app = (0, _express2.default)();

app.get('/:id', function (req, res) {
  var query = {
    me: req.params.id,
    eid: req.query.eid
  };

  (0, _request2.default)({
    method: 'GET',
    uri: 'http://b.hatena.ne.jp/' + query.me + '/bookmark?fragment=comments&eids=' + query.eid,
    headers: { 'User-Agent': 'HBFav/0.0.1' },
    timeout: 5 * 1000
  }, function (err, response, body) {
    // TODO: error handling
    // console.log(body);

    var $ = _cheerio2.default.load(body);
    var comments = $('ul.entry-comment > li.others').map(function () {
      return {
        user: $(this).data('user'),
        epoch: $(this).data('epoch'),
        // 2015/11/08 11:51:41
        timestamp: _moment2.default.unix($(this).data('epoch')).format('YYYY/MM/DD HH:mm:ss'),
        comment: $(this).find('span.comment').text()
      };
    }).get();

    res.send({
      eid: query.eid,
      comments: comments
    });
  });
});

app.listen(process.env.PORT || 3000);