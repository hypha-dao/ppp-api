import * as Sentry from '@sentry/node';
import { ResponseUtil } from './util';
import { ChatDao } from "./dao";
import { AuthApiFactory } from "./service";

Sentry.init({ dsn: process.env.sentryDsn });

const chatDao = new ChatDao();

export async function main(event, context) {
    try {
        const body = JSON.parse(event.body);
        const {
            limit,
            lastEvaluatedKey,
            search,
        } = body;

        const authApi = AuthApiFactory.getInstance(event, body);
        const { appId } = await authApi.getApp();
        const eosAccount = await authApi.getUserName();
        const chats = await chatDao.search({
            appId,
            eosAccount,
            search,
            limit,
            lastEvaluatedKey
        });
        return ResponseUtil.success({
            status: true,
            chats,
        });
    } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return ResponseUtil.failure(e);
    }
}
