var webdriverio = require('webdriverio');
var chai = require('chai');
var assert = chai.assert;
var chaiAsPromised = require('chai-as-promised');
var H = require('./helpers')
var Q = require('Q')

chai.should();
chai.use(chaiAsPromised);

var options = {
  desiredCapabilities: {
    browserName: 'chrome'
  }
};

var client = webdriverio.remote(options);
var appUrl = 'http://todomvc.com/examples/knockoutjs/';

function pressButton(submitKey) {
  return function(selector, cb) {
    client.addValue(selector, submitKey, cb);
  }
}
client.addCommand("pressReturn", pressButton('\uE006'));
client.addCommand("pressEnter", pressButton('\uE007'));

function resetBrowser() {
  client.end();
  return client.init().url(appUrl).waitFor('#todoapp', 5000);
}

describe('Todos', function() {

  before(function() { return client.init().url(appUrl).waitFor('#todoapp', 5000); });

  after(function() { return client.end(); });

  describe('The page elements', function() {
    it('should have the header "todos"', function() {
      return client.getText('header#header > h1').should.become('todos')
    });
    it('should have an input with the correct placeholder', function() {
      return client.getAttribute('input#new-todo', 'placeholder').should.eventually.equal('What needs to be done?')
    });
    it('should have instructions', function() {
      return client.getText('footer#info > p:first-child').should.eventually.equal('Double-click to edit a todo')
    });
  });

  describe('Adding a todo', function() {
    beforeEach(resetBrowser);
    it('should add an item to the todo list if text is entered and return is pressed', function() {
      var randomString = H.getRandomString();
      return client.setValue('input#new-todo', randomString)
          .pressReturn('input#new-todo')
          .getText('ul#todo-list > li').should.eventually.equal(randomString);
    });
    it('should add an item to the todo list if text is entered and enter is pressed', function() {
      var randomString = H.getRandomString();
      return client.setValue('input#new-todo', randomString)
          .pressEnter('input#new-todo')
          .getText('ul#todo-list > li').should.eventually.equal(randomString);
    });
    it('should not add an item to the todo list if no text is entered', function() {
      return client
        .pressReturn('input#new-todo')
        .getText('ul#todo-list').should.eventually.equal('')
    });
    it('should add new items after the existing ones', function() {
      var randomTodos = H.getRandomStrings(10);
      return Q.all(randomTodos
        .map(function(todo) {
          return client
            .setValue('input#new-todo', todo)
            .pressReturn('input#new-todo')
        })
        .map(function(todo, i) {
          return client
            .getText('ul#todo-list > li:nth-child(' + (i+1) + ')')
            .should.eventually.equal(randomTodos[i])
        })
      );
    });
  })

  describe('Checking a todo', function() {
    beforeEach(resetBrowser);
    it('should cross off a todo', function() {
      return client
        .setValue('input#new-todo', H.getRandomString())
        .pressReturn('input#new-todo')
        .click('ul#todo-list > li input.toggle')
        .getAttribute('ul#todo-list > li', 'class').should.eventually.contain('completed')
    });
    it('should make the todo visible on the "completed" list', function() {
      var randomString = H.getRandomString()
      return client
        .setValue('input#new-todo', randomString)
        .pressReturn('input#new-todo')
        .click('ul#todo-list > li input.toggle')
        .click('#filters > li:nth-child(3)')
        .getText('ul#todo-list > li').should.eventually.equal(randomString);
    });
  });

  describe('Removing a todo', function() {
    beforeEach(function() {
      return client.execute(H.fixObnoxiouslyInaccessableDestroyTodoButton);
    });
    it('should remove a todo from the list', function() {
      return client
        .setValue('input#new-todo', H.getRandomString())
        .pressReturn('input#new-todo')
        .click('ul#todo-list li .destroy');
    });
  });

});
