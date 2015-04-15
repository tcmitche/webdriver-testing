var webdriverio = require('webdriverio');
var chai = require("chai");
var assert = chai.assert;
var chaiAsPromised = require("chai-as-promised");
var _ = require("lodash");
var Q = require("q");

chai.should();
chai.use(chaiAsPromised);

var options = {
  desiredCapabilities: {
    browserName: 'chrome'
  }
};

var client = require("webdriverio").remote(options);
var appUrl = 'http://todomvc.com/examples/angularjs/';

function getRandomString(len) {
  var chars = '`1234567890-=~!@#$%^&*()_+qwertyuiop[]\\QWERTYUIOP{}|asdfghjkl;\'ASDFGHJKL:"zxcvbnm,./ZXCVBNM<>?'
  return _.sample(_.shuffle(chars.split('')), 10).join('');
}

function getRandomStrings(n, len) {
  return _.range(2, _.random(3, n)).map(_.partial(getRandomString, len));
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
    function addTodoTest(submitKey) {
      submitKey = submitKey || '\uE006';
      return function() {
        var randomString = getRandomString(10);
        return client.setValue('input#new-todo', randomString)
          .addValue('input#new-todo', submitKey)
          .getText('ul#todo-list > li').should.eventually.equal(randomString);
      };
    }
    beforeEach(function() {
      client.end();
      return client.init().url(appUrl).waitFor('#todoapp', 5000);
    });
    it('should add an item to the todo list if text is entered and return is pressed', addTodoTest());
    it('should add an item to the todo list if text is entered and enter is pressed', addTodoTest('\uE007'));
    it('should not add an item to the todo list if no text is entered', function() {
      client.addValue('input#new-todo', '\uE006')
      client.getText('ul#todo-list').should.eventually.equal('')
    });
    it('should add new items after the existing ones', function() {
      var randomTodos = getRandomStrings(10, 10);
      randomTodos.map(function(todo) {
        client.setValue('input#new-todo', todo).addValue('input#new-todo', '\uE006');
      });
      assert.eventually.sameMembers(client.getText('ul#todo-list > li'), randomTodos);
      randomTodos.map(function(todo, i) {
        client.getText('ul#todo-list > li:nth-child(' + (i+1) + ')').should.eventually.equal(todo)
      });
    });
  })

  describe('Checking a todo', function() {
    beforeEach(function() {
      client.end();
      return client.init().url(appUrl).waitFor('#todoapp', 5000);
    });
    it('should cross off a todo', function() {
      client.setValue('input#new-todo', getRandomString(10))
        .addValue('input#new-todo', '\uE006')
        .click('ul#todo-list > li input.toggle')
        .getAttribute('ul#todo-list > li', 'class').should.eventually.contain('completed')
    });
    it('should make the todo visible on the "completed" list', function() {
      var randomString = getRandomString(10)
      client.setValue('input#new-todo', randomString)
        .addValue('input#new-todo', '\uE006')
        .click('ul#todo-list > li input.toggle')
        .click('#filters > li:nth-child(3)')
        .getText('ul#todo-list > li').should.eventually.equal(randomString);
    });
  });

});
