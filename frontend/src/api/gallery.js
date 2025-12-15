import request from '../utils/request'

export function getGalleryList(params = {}) {
    return request({
        url: '/gallery/list',
        method: 'get',
        params
    })
}

export function getGalleryPage(page = 1, size = 10, extraParams = {}) {
    return request({
        url: '/gallery/page',
        method: 'get',
        params: { page, size, ...extraParams }
    })
}

export function likeGallery(id) {
    return request({
        url: '/gallery/like',
        method: 'post',
        params: { id }
    })
}

export function pinGallery(id, pinned) {
    return request({
        url: '/admin/gallery/pin',
        method: 'post',
        params: { id, pinned }
    })
}

export function setHomeCover(id) {
    return request({
        url: '/admin/gallery/home-cover',
        method: 'post',
        params: { id }
    })
}

export function deleteGallery(id) {
    return request({
        url: '/admin/gallery/delete',
        method: 'post',
        data: { id }
    })
}
