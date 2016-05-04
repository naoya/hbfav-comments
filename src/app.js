import express from 'express'
import errorhandler from 'errorhandler'
import request from 'request'
import cheerio from 'cheerio'
import moment from 'moment'

const app = express();
app.use(errorhandler());

process.on('uncaughtException', (err) => { 
  console.log(err) 
});

function getEntryInfo(url) {
  return new Promise((resolve, reject) => {
    const encodedUrl = encodeURIComponent(url);
    request({
      method: 'GET',
      uri: `http://b.hatena.ne.jp/entry/jsonlite/?url=${encodedUrl}`,
      headers: {
        'User-Agent': 'HBFav-Comments/0.0.1',
        'Cache-Control': 'no-cache'
      },
      timeout: 10 * 1000
    }, (err, response, body) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(body);
    });
  });
}

function getFollowersCommentsFragment(user, eid) {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      uri: `http://b.hatena.ne.jp/${user}/bookmark?fragment=comments&eids=${eid}`,
      headers: {'User-Agent': 'HBFav-Comments/0.0.1'},
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
  return $('ul.entry-comment').find('li.mine, li.others').map(function() {
    return {
      user:  $(this).data('user'),
      epoch: $(this).data('epoch'),
      // 2015/11/08 11:51:41
      timestamp: moment.unix($(this).data('epoch')).utcOffset(9).format('YYYY/MM/DD HH:mm:ss'),
      comment: $(this).find('span.comment').text()
    };
  }).get();
}

app.get('/:id', (req, res) => {
  let responseData;
  getEntryInfo(req.query.url)
    .then((json) => { return JSON.parse(json) })
    .then((entry) => {
      responseData = entry;
      return getFollowersCommentsFragment(req.params.id, entry.eid) 
    })
    .then((html) => { return parseFragmentHtml(html) })
    .then((followers) => {
      responseData.followers = followers;
      res.send(responseData) 
    })
    .catch(function(reason) {
      res.send(reason);
    });
});

app.listen(process.env.PORT || 3000);
