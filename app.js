'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_moment2.default.locale('ja');
var app = (0, _express2.default)();
app.use((0, _errorhandler2.default)());

function getFollowersCommentsFragment(user, eid) {
  return new Promise(function (resolve) {
    (0, _request2.default)({
      method: 'GET',
      uri: 'http://b.hatena.ne.jp/' + user + '/bookmark?fragment=comments&eids=' + eid,
      headers: { 'User-Agent': 'HBFav-Comments/0.0.1' },
      timeout: 5 * 1000
    }, function (err, response, body) {
      if (err) {
        reject(err);
        return;
      }
      resolve(body);
    });
  });
}

function parseFragmentHtml(html) {
  var $ = _cheerio2.default.load(html);
  return $('ul.entry-comment > li.others').map(function () {
    return {
      user: $(this).data('user'),
      epoch: $(this).data('epoch'),
      // 2015/11/08 11:51:41
      timestamp: _moment2.default.unix($(this).data('epoch')).format('YYYY/MM/DD HH:mm:ss'),
      comment: $(this).find('span.comment').text()
    };
  }).get();
}

app.get('/:id', function (req, res) {
  // TODO: Error Handling
  getFollowersCommentsFragment(req.params.id, req.query.eid).then(function (html) {
    var comments = parseFragmentHtml(html);
    res.send({ eid: req.query.eid, comments: comments });
  });
});

app.listen(process.env.PORT || 3000);