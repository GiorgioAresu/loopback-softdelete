/**
 * Tests inspired by https://github.com/clarkbw/loopback-ds-timestamp-mixin
 */

var test = require('tap').test;

var app = require('loopback');

// https://github.com/strongloop/loopback-boot/blob/master/lib/executor.js#L57-L71
// the loopback-boot module patches in the loopback attribute so we can assume the same
app.loopback = require('loopback');

var dataSource = app.createDataSource({
    connector: app.Memory
});

// import soft delete mixin
require('../')(app);

test('loopback soft delete', function (tap) {
    'use strict';

    tap.test('deletedAt', function (t) {

        var Book = dataSource.createModel('Book',
            {name: String, type: String},
            {mixins: {SoftDelete: true}}
        );

        t.test('should be no records found on database', function (tt) {
            Book.create({name: 'book 1', type: 'fiction'}, function (err, book) {
                Book.destroyAll(function () {
                    Book.count(function (err, count) {
                        tt.equal(0, count);
                        tt.end();
                    });
                });
            });
        });

        t.test('should be records found on database', function (tt) {
            Book.create({name: 'book 1', type: 'fiction'}, function (err, book) {
                Book.destroyAll(function () {
                    Book.count({isDeleted: true}, function (err, count) {
                        tt.notEqual(0, count);
                        tt.end();
                    });
                });
            });
        });

        t.end();

    });

    tap.test('isDeleted', function (t) {

        var Book = dataSource.createModel('Book',
            {name: String, type: String},
            {mixins: {SoftDelete: true}}
        );

        t.test('should be with isDeleted false', function (tt) {
            Book.create({name: 'book 1', type: 'fiction'}, function (err, book) {
                tt.equal(false, book.isDeleted);
                tt.end();
            });
        });

        t.test('should be with isDeleted true', function (tt) {
            Book.create({name: 'book 1', type: 'fiction'}, function (err, book) {
                var bookId = book.id;
                Book.destroyById(bookId, function () {
                    Book.find({ where: {id: bookId, isDeleted: true} }, function (err, b) {
                        b = b.shift();
                        tt.equal(true, b.isDeleted);
                        tt.end();
                    });
                });
            });
        });

        t.end();

    });

    tap.test('find  isDeleted one  when  include', function (t) {

        var Book = dataSource.createModel('Book',
            {name: String, type: String},
            {mixins: {SoftDelete: true}}
        );
        var Author =dataSource.createModel('Author',
        {name: String},
        {mixins: {SoftDelete: true}}
        );
        Book.belongsTo(Author, {foreignKey: 'authorId'});
        Author.hasMany(Book,{as: 'books', foreignKey: 'authorId'});
        let authorId = '';
        let bookId ='';
        t.test(' author should be with isDeleted false', function (tt) {
            Author.create({name: 'author1'}, function (err, author) {
                authorId = author.id;
                tt.equal(false, author.isDeleted);
                tt.end();
            });
        });

        t.test('should be with isDeleted false', function (tt) {
            Book.create({name: 'book 1', type: 'fiction',authorId: authorId}, function (err, book) {
                tt.equal(false, book.isDeleted);
                tt.end();
            });
        });

        t.test('should be with isDeleted true', function (tt) {
            Book.create({name: 'book 1', type: 'fiction', authorId: authorId}, function (err, book) {
                bookId = book.id;
                Book.destroyById(bookId, function () {
                    Book.find({ where: {id: bookId, isDeleted: true} }, function (err, b) {
                        b = b.shift();
                        tt.equal(true, b.isDeleted);
                        tt.end();
                    });
                });
            });
        });
        t.test('should be with isDeleted true can include find ', function (tt) {
            Author.find({where:{id:authorId},include:'books'}, {include:['Book']},function (err, authors) {
                tt.equal(2, authors[0].books().length);
                tt.end();
            });
        });

        t.end();

    });


    tap.end();

});
