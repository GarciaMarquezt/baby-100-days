import request from '../utils/request'

export function getGalleryList() {
    return request({
        url: '/gallery/list',
        method: 'get'
    })
}

export function getGalleryPage(page = 1, size = 20) {
    return request({
        url: '/gallery/page',
        method: 'get',
        params: { page, size }
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

export function deleteGallery(id) {
    return request({
        url: '/gallery/admin/delete',
        method: 'delete',
        params: { id }
    })
}
