const _ = require('lodash');
const getHomepage = require('./poc').getHomepageJson;

const getNewest = (body) => {
  const heroPromos = _.find(body.collections, (hpModule) => {
    return hpModule.type === 'hero-promos';
  });

  return _.take(heroPromos.model)[0];
};

const whatsNewHandler = (done) => {
  getHomepage().then((body) => {
    const newest = getNewest(body);
    done(newest);
  });
}

module.exports = whatsNewHandler;