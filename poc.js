var request = require("request");
var rp = require('request-promise');
var _ = require('lodash');

module.exports =  {

  analyseSentiment: function analyseSentiment(pdocuments) {
    const OCP_APIM_SUBSCRIPTION_KEY = process.env.OCP_APIM_SUBSCRIPTION_KEY
    return rp({ 
      method: 'POST',
      // url: 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',
      url: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',
      headers:
      { 
        'ocp-apim-subscription-key': OCP_APIM_SUBSCRIPTION_KEY,
        'content-type': 'application/json' 
      },
      body:{ documents: pdocuments },
      json: true 
    });
  },

  getHomepageJson: function getHomepageJson() {
    return rp({
      url: 'https://homepage.api.bbc.co.uk/json/3a65e1d2-5f49-473c-b60e-cdb1decc0a3f',
      json: true
    });
  },

  getHomepageStories: function getHomepageStories(homepageJson) {
    return _.reduce(homepageJson.collections, function(acc, value) {
      return _.concat(acc, value.model);
    }, []);
  },

  getHomepageStoriesAsDocuments: function getHomepageStoriesAsDocuments(homepageStories) {
    const documents = _.map(homepageStories, function(model, index) {
      return {
        language: "en",
        id: model.url,
        text: model.title
      }
    });
    return _.uniqBy(documents, 'id');
  },

  sortSentiment: function getHighestScoringSentiment(sentimentResponse, order) {
    return _.orderBy(sentimentResponse.documents, 'score', order);
  }

}
