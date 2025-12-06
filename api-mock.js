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

// 初始化一些示例数据
function initMockData() {
    // 示例图片（使用本地路径或占位图）
    const sampleImages = [
        { id: 1, filename: '1.jpg', type: 'image', likes: 5, is_pinned: 1, created_at: Date.now() - 86400000 },
        { id: 2, filename: '2.jpg', type: 'image', likes: 3, is_pinned: 0, created_at: Date.now() - 172800000 },
        { id: 3, filename: '3.jpg', type: 'image', likes: 8, is_pinned: 0, created_at: Date.now() - 259200000 },
        { id: 4, filename: '4.jpg', type: 'image', likes: 2, is_pinned: 0, created_at: Date.now() - 345600000 },
        { id: 5, filename: '5.jpg', type: 'image', likes: 12, is_pinned: 0, created_at: Date.now() - 432000000 },
        { id: 6, filename: '6.jpg', type: 'image', likes: 7, is_pinned: 0, created_at: Date.now() - 518400000 },
        { id: 7, filename: '7.jpg', type: 'image', likes: 4, is_pinned: 0, created_at: Date.now() - 604800000 },
        { id: 8, filename: '8.jpg', type: 'image', likes: 9, is_pinned: 0, created_at: Date.now() - 691200000 },
        { id: 9, filename: '9.jpg', type: 'image', likes: 6, is_pinned: 0, created_at: Date.now() - 777600000 },
        { id: 10, filename: '10.jpg', type: 'image', likes: 11, is_pinned: 0, created_at: Date.now() - 864000000 }
    ];
    
    // 示例视频
    const sampleVideos = [
        { id: 11, filename: 'video1.mp4', type: 'video', likes: 15, is_pinned: 0, created_at: Date.now() - 3600000 },
        { id: 12, filename: 'video2.mp4', type: 'video', likes: 8, is_pinned: 0, created_at: Date.now() - 7200000 },
        { id: 13, filename: 'video3.mp4', type: 'video', likes: 20, is_pinned: 1, created_at: Date.now() - 10800000 }
    ];
    
    mockData.files = [...sampleImages, ...sampleVideos];
    
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
                    return {
                        ...file,
                        comments: comments.slice(0, 3), // 只返回最近3条
                        url: file.type === 'image' 
                            ? `babyimage/${file.filename}` 
                            : `babyimage/${file.filename}`
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
                mockData.comments[id].unshift({
                    content: content,
                    created_at: Date.now()
                });
                
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
    // 检查是否是 mock API 请求
    if (typeof url === 'string' && url.includes('action=')) {
        const urlObj = new URL(url, window.location.origin);
        const action = urlObj.searchParams.get('action');
        
        if (action) {
            // 解析请求
            if (options && options.method === 'POST') {
                const body = JSON.parse(options.body || '{}');
                
                switch(action) {
                    case 'list':
                        return mockAPI.list().then(data => new Response(JSON.stringify(data), {
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'like':
                        return mockAPI.like(body.id).then(data => new Response(JSON.stringify(data), {
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'unlike':
                        return mockAPI.unlike(body.id).then(data => new Response(JSON.stringify(data), {
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'comment':
                        return mockAPI.comment(body.id, body.content).then(data => new Response(JSON.stringify(data), {
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'delete_comment':
                        return mockAPI.deleteComment(body.comment_id).then(data => new Response(JSON.stringify(data), {
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'pin':
                        return mockAPI.pin(body.id, body.password).then(data => new Response(JSON.stringify(data), {
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    case 'upload':
                        // 处理文件上传（简化版）
                        return new Promise((resolve) => {
                            const formData = options.body;
                            const files = [];
                            // 这里简化处理，实际应该解析 FormData
                            resolve(new Response(JSON.stringify({
                                success: true,
                                uploaded: [],
                                errors: []
                            }), {
                                headers: { 'Content-Type': 'application/json' }
                            }));
                        });
                }
            } else if (action === 'list') {
                return mockAPI.list().then(data => new Response(JSON.stringify(data), {
                    headers: { 'Content-Type': 'application/json' }
                }));
            }
        }
    }
    
    // 其他请求使用原始 fetch
    return originalFetch.apply(this, arguments);
};

console.log('✅ Mock API 已加载，可以在本地测试了！');

