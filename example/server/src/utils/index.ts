import * as _ from 'lodash';
import * as Koa from 'koa';
import * as uuid from 'uuid/v4';

import { encryptData, decryptData } from './crypto';

export default {
    pagination(ctx: Koa.Context, data: object[], filter?): object {
        if (filter) {
            data = _.filter(data, filter);
        }
        let sort = ctx.query.sort;
        if (sort) {
            sort = sort.split(',');
            sort = sort.map((field) => field.split(' '));
            sort = _.zip(...sort);
            data = _.orderBy(data, ...sort);
        }
        const pageNum = parseInt(ctx.query.pageNum, 10);
        const pageSize = parseInt(ctx.query.pageSize, 10);
        const sIndex = (pageNum - 1) * pageSize;
        const eIndex = pageNum * pageSize;

        return {
            page: {
                pageNum,
                total: data.length,
            },
            data: _.slice(data, sIndex, eIndex),
        };
    },

    isMatch: (data: object, fields: string[] | string, material: string) => {
        material = material.toLowerCase();
        if (typeof fields === 'string') {
            fields = fields.split(',');
        }
        return _.some(fields, (field) => {
            return String(data[field]).toLowerCase().includes(material);
        });
    },

    uuid,

    encryptData,

    decryptData,
};
