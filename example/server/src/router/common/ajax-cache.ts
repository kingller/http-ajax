import { get } from 'koa-router-decors';
import * as moment from 'moment';
import * as fs from 'fs';

export default class Person {
    @get('/pdr/ajax/send')
    public async getData(ctx) {
        ctx.body = {
            result: true,
            data: `${moment().format('YYYY-MM-DD hh:mm:ss')}`,
        };
    }
    @get('/pdr/ajax/cache')
    public async getTestData(ctx) {
        ctx.body = {
            result: true,
            data: `${moment().format('YYYY-MM-DD hh:mm:ss')}`,
        };
    }

    @get('/pdr/ajax/download')
    public async downloadFile(ctx) {
        let d;
        await new Promise((resolve) => {
            fs.readFile(`${process.cwd()}/src/public/temp/temp.jpg`, function (err, data) {
                if (err) {
                    console.error(err);
                } else {
                    d = data;
                    resolve(data);
                }
            });
        });
        console.log(d);
        ctx.body = d;
        ctx.set('Content-Type', 'application/octet-stream;charset=utf-8');
        ctx.set('Content-disposition', 'attachment;filename=1.txt');
    }
}
