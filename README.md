[![NPM](https://nodei.co/npm/loopback-softdelete.png?compact=true)](https://npmjs.org/package/loopback-softdelete)

Loopback SoftDelete
=============

This module is designed for the [Strongloop Loopback](https://github.com/strongloop/loopback) framework. It allows entities of any Model to be "soft deleted" by adding `deletedAt` and `isDeleted` attributes. Queries following the standard format will not return these entities; they can only be accessed by adding `{ isDeleted: true }` to  qutheery object (at the same level as `where`, `include` etc).

Install
-------

##### NPM
```bash
  npm install --save loopback-softdelete
```

##### YARN
```bash
  yarn add loopback-softdelete
```

Configure
----------

Add the `mixins` property to your `server/model-config.json`:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-softdelete",
      "../common/mixins"
    ]
  }
}
```

To use with your Models add the `mixins` attribute to the definition object of your model config.

```json
  {
    "name": "project",
    "plural": "projects",
    "base": "PersistedModel",
    "properties": {
      "name": {
        "type": "string",
        "required": true
      }
    },
    "mixins": {
      "SoftDelete" : true,
    },
  },
```

##### include find
```javascript
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
        Author.find({where:{id:authorId},include:'books'}, {include:['Book']},function (err, authors) {
        });
```

Retrieving deleted entities
---------------------------

To run queries that include deleted items in the response, add `{ isDeleted: true }` to the query object (at the same level as `where`, `include` etc).

Testing
---------------------------

Run tests using this command.

```bash
  npm test
```
