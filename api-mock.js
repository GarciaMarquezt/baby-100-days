/**
 * 本地 Mock API - 用于本地开发测试
 * 使用方法：在 gallery.html 中引入此文件，并设置 API_URL = 'mock'
 */

// Mock 数据存储
const mockData = {
    files: [],
    comments: {},
    likes: {}
};

// 初始化一些示例数据（动态扫描本地文件）
function initMockData() {
    // 清空现有数据
    mockData.files = [];
    
    // 尝试动态扫描本地文件（仅用于本地测试）
    // 注意：浏览器环境无法直接访问文件系统，所以这里仍然使用示例数据
    // 但在真实服务器环境中，api.php 会动态扫描目录
    
    // 示例图片（用于本地测试，实际服务器会从目录扫描）
    const sampleImages = [
        { id: 1, filename: '1.jpg', type: 'image', likes: 5, is_pinned: 1, created_at: Math.floor((Date.now() - 86400000) / 1000) },
        { id: 2, filename: '2.jpg', type: 'image', likes: 3, is_pinned: 0, created_at: Math.floor((Date.now() - 172800000) / 1000) },
        { id: 3, filename: '3.jpg', type: 'image', likes: 8, is_pinned: 0, created_at: Math.floor((Date.now() - 259200000) / 1000) },
        { id: 4, filename: '4.jpg', type: 'image', likes: 2, is_pinned: 0, created_at: Math.floor((Date.now() - 345600000) / 1000) },
        { id: 5, filename: '5.jpg', type: 'image', likes: 12, is_pinned: 0, created_at: Math.floor((Date.now() - 432000000) / 1000) },
        { id: 6, filename: '6.jpg', type: 'image', likes: 7, is_pinned: 0, created_at: Math.floor((Date.now() - 518400000) / 1000) },
        { id: 7, filename: '7.jpg', type: 'image', likes: 4, is_pinned: 0, created_at: Math.floor((Date.now() - 604800000) / 1000) },
        { id: 8, filename: '8.jpg', type: 'image', likes: 9, is_pinned: 0, created_at: Math.floor((Date.now() - 691200000) / 1000) },
        { id: 9, filename: '9.jpg', type: 'image', likes: 6, is_pinned: 0, created_at: Math.floor((Date.now() - 777600000) / 1000) },
        { id: 10, filename: '10.jpg', type: 'image', likes: 11, is_pinned: 0, created_at: Math.floor((Date.now() - 864000000) / 1000) }
    ];
    
    // 示例视频（用于本地测试，实际服务器会从目录扫描）
    const sampleVideos = [
        { id: 11, filename: 'video1.mp4', type: 'video', likes: 15, is_pinned: 0, created_at: Math.floor((Date.now() - 3600000) / 1000) },
        { id: 12, filename: 'video2.mp4', type: 'video', likes: 8, is_pinned: 0, created_at: Math.floor((Date.now() - 7200000) / 1000) },
        { id: 13, filename: 'video3.mp4', type: 'video', likes: 20, is_pinned: 1, created_at: Math.floor((Date.now() - 10800000) / 1000) }
    ];
    
    mockData.files = [...sampleImages, ...sampleVideos];
    
    console.log('Mock API: 初始化了', mockData.files.length, '个文件（本地测试用，实际服务器会动态扫描目录）');
    
    // 示例评论
    mockData.comments = {
        1: [
            { content: '太可爱了！', created_at: Date.now() - 3600000 },
            { content: '祝福宝宝健康成长！', created_at: Date.now() - 7200000 }
        ],
        2: [
            { content: '好萌啊！', created_at: Date.now() - 1800000 }
        ],
        11: [
            { content: '视频太棒了！', created_at: Date.now() - 5400000 }
        ]
    };
}

// 初始化
initMockData();

// Mock API 函数
window.mockAPI = {
    // 获取文件列表
    list: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const files = mockData.files.map(file => {
                    const comments = mockData.comments[file.id] || [];
                    // 转换时间戳为秒级（如果已经是秒级则不变）
                    const formattedComments = comments.map((comment, index) => ({
                        ...comment,
                        id: comment.id || (index + 1),
                        created_at: comment.created_at ? (comment.created_at > 10000000000 ? Math.floor(comment.created_at / 1000) : comment.created_at) : Math.floor(Date.now() / 1000)
                    }));
                    return {
                        ...file,
                        comments: formattedComments, // 返回所有评论，不限制数量
                        url: file.type === 'image' 
                            ? `uploads/images/${file.filename}` 
                            : `uploads/videos/${file.filename}`
                    };
                });
                
                const videos = files.filter(f => f.type === 'video');
                const images = files.filter(f => f.type === 'image');
                
                resolve({
                    success: true,
                    videos: videos,
                    images: images
                });
            }, 300); // 模拟网络延迟
        });
    },
    
    // 点赞
    like: function(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const file = mockData.files.find(f => f.id === id);
                if (file) {
                    file.likes = (file.likes || 0) + 1;
                    resolve({
                        success: true,
                        likes: file.likes
                    });
                } else {
                    resolve({ success: false });
                }
            }, 200);
        });
    },
    
    // 取消点赞
    unlike: function(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const file = mockData.files.find(f => f.id === id);
                if (file && file.likes > 0) {
                    file.likes = file.likes - 1;
                    resolve({
                        success: true,
                        likes: file.likes
                    });
                } else {
                    resolve({ success: false });
                }
            }, 200);
        });
    },
    
    // 评论
    comment: function(id, content) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!mockData.comments[id]) {
                    mockData.comments[id] = [];
                }
                // 使用秒级时间戳
                mockData.comments[id].unshift({
                    content: content,
                    created_at: Math.floor(Date.now() / 1000), // 秒级时间戳
                    id: mockData.comments[id].length + 1
                });
                
                console.log('Mock API: 评论已保存，itemId:', id, '评论内容:', content);
                console.log('Mock API: 当前评论列表:', mockData.comments[id]);
                
                resolve({ success: true });
            }, 300);
        });
    },
    
    // 删除评论
    deleteComment: function(commentId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 简单实现：遍历所有评论删除
                for (let fileId in mockData.comments) {
                    mockData.comments[fileId] = mockData.comments[fileId].filter(
                        (c, index) => index !== commentId
                    );
                }
                resolve({ success: true });
            }, 200);
        });
    },
    
    // 上传文件
    upload: function(files) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const uploaded = [];
                files.forEach((file, index) => {
                    const ext = file.name.split('.').pop().toLowerCase();
                    const type = ['mp4', 'mov', 'avi'].includes(ext) ? 'video' : 'image';
                    const newFile = {
                        id: mockData.files.length + 1 + index,
                        filename: file.name,
                        type: type,
                        likes: 0,
                        is_pinned: 0,
                        created_at: Date.now()
                    };
                    mockData.files.push(newFile);
                    uploaded.push(newFile);
                });
                
                resolve({
                    success: true,
                    uploaded: uploaded,
                    errors: []
                });
            }, 1000);
        });
    },
    
    // 置顶
    pin: function(id, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (password !== '123') {
                    resolve({ success: false, message: '密码错误' });
                    return;
                }
                const file = mockData.files.find(f => f.id === id);
                if (file) {
                    file.is_pinned = file.is_pinned ? 0 : 1;
                    resolve({ success: true });
                } else {
                    resolve({ success: false });
                }
            }, 200);
        });
    }
};

// 拦截 fetch 请求（如果 API_URL 设置为 'mock'）
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    const urlString = typeof url === 'string' ? url : (url && url.url ? url.url : '');
    
    // 检查是否是 mock API 请求
    // 1. URL 是 'mock' 开头
    // 2. 或者 URL 包含 'action=' 且是本地环境
    const isMockRequest = urlString.startsWith('mock') || 
                          (urlString.includes('action=') && 
                           (window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.search.includes('mock=1')));
    
    if (isMockRequest) {
        console.log('🎭 Mock API 拦截请求:', urlString);
        
        try {
            let action = null;
            let body = {};
            
            // 解析 URL 获取 action
            if (urlString.includes('action=')) {
                try {
                    const urlObj = new URL(urlString, window.location.origin);
                    action = urlObj.searchParams.get('action');
                } catch (e) {
                    // 如果 URL 解析失败，尝试手动解析
                    const match = urlString.match(/action=([^&]+)/);
                    if (match) action = match[1];
                }
            } else if (urlString.startsWith('mock')) {
                // 如果 URL 就是 'mock'，尝试从 options 中获取
                if (options && options.url) {
                    const match = options.url.match(/action=([^&]+)/);
                    if (match) action = match[1];
                }
            }
            
            // 解析 POST 请求体
            if (options && options.method === 'POST' && options.body) {
                if (typeof options.body === 'string') {
                    try {
                        body = JSON.parse(options.body);
                    } catch (e) {
                        console.warn('无法解析请求体:', e);
                    }
                } else if (options.body instanceof FormData) {
                    // FormData 处理（上传文件）
                    body = { isFormData: true, formData: options.body };
                }
            }
            
            if (action) {
                console.log('🎭 Mock API 处理:', action, body);
                
                switch(action) {
                    case 'list':
                        return mockAPI.list().then(data => {
                            console.log('🎭 Mock API 返回列表数据:', data);
                            return new Response(JSON.stringify(data), {
                                status: 200,
                                headers: { 'Content-Type': 'application/json' }
                            });
                        });
                    case 'like':
                        return mockAPI.like(body.id).then(data => new Response(JSON.stringify(data), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'unlike':
                        return mockAPI.unlike(body.id).then(data => new Response(JSON.stringify(data), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'comment':
                        return mockAPI.comment(body.id, body.content).then(data => new Response(JSON.stringify(data), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'delete_comment':
                        return mockAPI.deleteComment(body.comment_id).then(data => new Response(JSON.stringify(data), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'pin':
                        return mockAPI.pin(body.id, body.password).then(data => new Response(JSON.stringify(data), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'upload':
                        // 处理文件上传（简化版）
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(new Response(JSON.stringify({
                                    success: true,
                                    uploaded: [{ id: mockData.files.length + 1, filename: 'test.jpg', type: 'image' }],
                                    errors: []
                                }), {
                                    status: 200,
                                    headers: { 'Content-Type': 'application/json' }
                                }));
                            }, 500);
                        });
                    default:
                        console.warn('🎭 Mock API 未知 action:', action);
                }
            } else {
                console.warn('🎭 Mock API 无法解析 action');
            }
        } catch (e) {
            console.error('🎭 Mock API 错误:', e);
        }
    }
    
    // 其他请求使用原始 fetch
    return originalFetch.apply(this, arguments);
};

console.log('✅ Mock API 已加载，可以在本地测试了！');

