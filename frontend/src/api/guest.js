import request from '../utils/request'

export function registerGuest(data) {
    return request({
        url: '/guest/register',
        method: 'post',
        data
    })
}

export function queryGuest(phone) {
    return request({
        url: '/guest/query',
        method: 'get',
        params: { phone }
    })
}

