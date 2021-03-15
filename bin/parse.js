#!/usr/bin/env node
import got from 'got';
import cheerio from 'cheerio';
import _ from 'lodash';
import R from 'ramda';

const url = 'https://rb7.ru/afisha/movies';

const getSortNames = (names, func, infos = [], film_acc = 0, cinema_acc = 0) => {
  if (_.isEmpty(names)) {
    if (_.isEmpty(infos)) return [];

    const sortInfos = _.orderBy(infos, ['times'], ['desc']);

    return R.pluck('name', sortInfos);
  }

  const countCinema = func('tbody', 'table[class="afisha-schedule hidden-xs"]').eq(film_acc).children().get().length;
  let times = 0;
  for (let i = 0; i < countCinema; i++) {
    const cinemaTimes = func('td[class="when"]').eq(cinema_acc).children().length;
    times += cinemaTimes;
    cinema_acc += 1
  }
  const filmInfo = {
    name: _.head(names),
    times,
  }
  infos = [...infos, filmInfo];

  return getSortNames(names.slice(1, names.length), func, infos, film_acc + 1, cinema_acc);
}

const filmList = await got(url).then(response => {
  const $ = cheerio.load(response.body);
  const names = $('a', 'h2').map(function(i, el) {
    return $(this).text();
  }).get()

  return getSortNames(names, $)
});

console.log('Three most popular films:', filmList.slice(0, 3));
