const poc = require('./poc');
const builder = require('botbuilder');
const _ = require('lodash');

const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);
const app_id = process.env.LUIS_APP_ID;
const subscription_key = process.env.LUIS_SUBSCRIPTION_KEY
const recognizer = new builder.LuisRecognizer(`https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/${app_id}?subscription-key=${subscription_key}&staging=true&verbose=true&timezoneOffset=0.0&q=`);
const intents = new builder.IntentDialog({ recognizers: [recognizer] });
const whatsNewHandler = require('./whats-new-handler');

const prompt = (message) => `🤖 ::> ${message}`; 

bot.dialog('/', intents);

intents.matches('finish', [
  (session, args, next) => {
    
    if (process.env.NODE_ENV === 'development') {
      session.endConversation(prompt('gone for 🍺 & 🍔'));
      process.exit(0);
    } else {
      session.endConversation(prompt('good bye'));
    }
  }
]);

intents.matches('getEmotion', [
  (session, args, next) => {
    var documents;
    var stories;
    poc.getHomepageJson().then(function(json) {
        stories = poc.getHomepageStories(json);
        documents = poc.getHomepageStoriesAsDocuments(stories);
        return poc.analyseSentiment(documents);
    }).then(function(results) {
      let happiness = Math.round(_.reduce(results.documents, (sum, doc) => {
        let score = doc.score * 100;
        return sum + score;
      }, 0) / results.documents.length);
      
      if (happiness < 20) {
        session.send(prompt("Very Sad"));
      } else if (happiness < 40) {
        session.send(prompt('Sad'));
      } else if (happiness < 60) {
        session.send(prompt('So So'));
        if (happiness > 41 && happiness < 43) {
          session.send(prompt('But, the answer to life, the universe and everthing is 42!'));
        }
      } else if (happiness < 80) {
        session.send(prompt('Happy'));
      } else if (happines < 100) {
        session.send(prompt('Very Happy'));
      } else {
        session.send(prompt('As happy as a kid in a candy store where everything is free'));
      }
      session.send(`Happiness::${happiness}`);
    }).catch(function(err) {
        console.log(err);
    });
  }
]);

intents.matches('getHappiestArticle', [
  (session, args, next) => {
    var documents;
    var stories;
    poc.getHomepageJson().then(function(json) {
        stories = poc.getHomepageStories(json);
        documents = poc.getHomepageStoriesAsDocuments(stories);
        return poc.analyseSentiment(documents);
    }).then(function(results) {
        const result = poc.sortSentiment(results, 'desc')[0];
        console.log('Article Score::',result.score * 100);
        const urlOfTheHappiestArticle = poc.sortSentiment(results, 'desc')[0].id;
        const happiest = _.find(stories, (story) => { return story.url === urlOfTheHappiestArticle});
        session.privateConversationData.currentArticle = happiest;
        session.send(prompt(happiest.title));
       

    }).catch(function(err) {
        console.log(err);
    });
  }
]);

intents.matches('greet', [
  (session, args, next) => {
    session.send(prompt('Hi am Bob'));
  }
]);

intents.matches('thanks', [
  (session, args, next) => {
    session.send(prompt('you are welcome'));
  }
]);

intents.matches('showHomepage', [
  function (session, args, next) {
    session.send(prompt('http://www.bbc.co.uk'));
  }
]);

intents.matches('whatsNew', [
  (session, args, next) => {
    session.sendTyping();
    whatsNewHandler((newest) => {
      session.privateConversationData.currentArticle = newest;
      const title = _.get(newest, 'title');      
      session.send(prompt(title));
      next();
    });
  }
]);

intents.matches('showMe', [
  function (session, args, next) {
    if (session.privateConversationData.currentArticle) {
      session.send(prompt(session.privateConversationData.currentArticle.url));
    }
    else {
      session.send(prompt('http://www.bbc.co.uk'));
    }
  }
]);
