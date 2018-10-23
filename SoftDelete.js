/**
 * Loopback SoftDelete
 *
 * To implement, add "SoftDelete": true in mixins section on YourModel.json file
 *
 * To run queries that include deleted items in the response,
 * add { isDeleted: true } to the query object (at the same level as where, include etc).
 */

module.exports = function (Model, options) {
    Model.defineProperty('deletedAt', {
        type: Date,
        required: false,
        mysql: {
            columnName: "deletedAt",
            dataType: "timestamp",
            dataLength: null,
            dataPrecision: null,
            dataScale: null,
            nullable: "Y"
        }
    });

    Model.defineProperty('isDeleted', {
        type: Boolean,
        required: true,
        default: false,
        mysql: {
            columnName: "isDeleted",
            dataType: "tinyint",
            dataLength: null,
            dataPrecision: 1,
            dataScale: 0,
            nullable: "Y"
        }
    });

    /**
     * Watches destroyAll(), deleteAll(), destroyById() , deleteById(), prototype.destroy(), prototype.delete() methods
     * and instead of deleting object, sets properties deletedAt and isDeleted.
     */
    Model.observe('before delete', function (ctx, next) {
        Model.updateAll(ctx.where, {deletedAt: new Date(), isDeleted: true}).then(function (result) {
            next(null);
        });
    });

    /**
     * When ever model tries to access data, we add by default isDeleted: false to where query
     * if there is already in query isDeleted property, then we do not modify query
     */
    Model.observe('access', function logQuery(ctx, next) {
        if(ctx.options.include && ctx.options.include.length > 0 && ctx.options.include.indexOf(ctx.Model.modelName)> -1){
             return next();
        }
        if (!ctx.query.hasOwnProperty('isDeleted') && (!ctx.query.where || ctx.query.where && JSON.stringify(ctx.query.where).indexOf('isDeleted') == -1)) {
            if (!ctx.query.where) ctx.query.where = {};
            ctx.query.where.isDeleted = {neq: true};
        }
        next();
    });
};
