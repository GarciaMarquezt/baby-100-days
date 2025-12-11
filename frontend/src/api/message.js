import request from '../utils/request'

export function sendMessage(data) {
    return request({
        url: '/message/send',
        method: 'post',
        data
    })
}

export function getMessageList(params) {
    return request({
        url: '/message/list',
        method: 'get',
        params
    })
}

// Admin API
export function getAdminMessageList(params) {
    return request({
        url: '/message/admin/list',
        method: 'get',
        params
    })
}

export function auditMessage(data) {
    return request({
        url: '/message/admin/audit',
        method: 'post',
        data
    })
}

