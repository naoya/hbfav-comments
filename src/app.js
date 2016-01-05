import express from 'express'
import request from 'request'
import cheerio from 'cheerio'
import moment from 'moment'

moment.locale('ja');
const app = express();

app.get('/:id', (req, res) => {
  const query = {
    me: req.params.id,
    eid: req.query.eid
  };
  
  request({
    method: 'GET',
    uri: `http://b.hatena.ne.jp/${query.me}/bookmark?fragment=comments&eids=${query.eid}`,
    headers: {'User-Agent': 'HBFav/0.0.1'},
    timeout: 5 * 1000
  }, (err, response, body) => {
    // TODO: error handling
    // console.log(body);
    
    const $ = cheerio.load(body);
    const comments = $('ul.entry-comment > li.others').map(function() {
      return {
        user:  $(this).data('user'),
        epoch: $(this).data('epoch'),
        // 2015/11/08 11:51:41
        timestamp: moment.unix($(this).data('epoch')).format('YYYY/MM/DD HH:mm:ss'),
        comment: $(this).find('span.comment').text()
      };
    }).get();
    
    res.send({
      eid: query.eid,
      comments: comments
    });
  })
});

app.listen(process.env.PORT || 3000);

