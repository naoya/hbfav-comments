import express from 'express'
import request from 'request'
import cheerio from 'cheerio'
import moment from 'moment'

moment.locale('ja');
const app = express();

function getFollowersCommentsFragment(user, eid) {
  return new Promise((resolve) => {
    request({
      method: 'GET',
      uri: `http://b.hatena.ne.jp/${user}/bookmark?fragment=comments&eids=${eid}`,
      headers: {'User-Agent': 'HBFav/0.0.1'},
      timeout: 5 * 1000
    }, (err, response, body) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(body);
    });
  });
}

function parseFragmentHtml(html) {
  const $ = cheerio.load(html);
  return $('ul.entry-comment > li.others').map(function() {
    return {
      user:  $(this).data('user'),
      epoch: $(this).data('epoch'),
      // 2015/11/08 11:51:41
      timestamp: moment.unix($(this).data('epoch')).format('YYYY/MM/DD HH:mm:ss'),
      comment: $(this).find('span.comment').text()
    };
  }).get();
}

app.get('/:id', (req, res) => {
  // TODO: Error Handling
  getFollowersCommentsFragment(req.params.id, req.query.eid).then((html) => {
    const comments = parseFragmentHtml(html);
    res.send({ eid: req.query.eid, comments: comments });    
  });
});

app.listen(process.env.PORT || 3000);
