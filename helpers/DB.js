import knex from 'knex';

export default class DB {

    static init() {
        this.radius = knex({
            client: 'mysql',
            connection: {
                host: 'mysql-deteconan.alwaysdata.net',
                user: 'deteconan',
                password: 'jesuiskudo',
                database: 'deteconan_sql'
            }
        });
    }

    static raw(raw) {
        return knex.raw(raw);
    }

    static getTable(table) {
        return this.radius(table);
    }

    static close() {
        this.radius.destroy();
    }

}
