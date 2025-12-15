import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    { path: '/', name: 'Home', component: () => import('../pages/Home.vue') },
    { path: '/invitation', name: 'Invitation', component: () => import('../pages/Invitation.vue') },
    { path: '/message', name: 'Message', component: () => import('../pages/Message.vue') },
    { path: '/gallery', name: 'Gallery', component: () => import('../pages/GalleryWall.vue') },
    
    // 版本对比页面
    { path: '/compare', name: 'Compare', component: () => import('../pages/Compare.vue') },
    
    // ChatGPT 简化版本演示路由
    { path: '/demo', name: 'DemoHome', component: () => import('../pages/demo/HomeSimple.vue') },
    { path: '/demo/invitation', name: 'DemoInvitation', component: () => import('../pages/demo/InvitationSimple.vue') },
    { path: '/demo/gallery', name: 'DemoGallery', component: () => import('../pages/demo/GalleryWallSimple.vue') },
    { path: '/demo/guest', name: 'DemoGuest', component: () => import('../pages/demo/GuestFormSimple.vue') },
    { path: '/demo/admin', name: 'DemoAdmin', component: () => import('../pages/demo/AdminSimple.vue') },
    
    // Admin Routes
    { path: '/admin/login', name: 'AdminLogin', component: () => import('../pages/admin/Login.vue') },
    { 
        path: '/admin/dashboard', 
        name: 'Dashboard', 
        component: () => import('../pages/admin/Dashboard.vue'),
        redirect: '/admin/dashboard/guests',
        children: [
            { path: 'guests', component: () => import('../pages/admin/GuestManage.vue') },
            { path: 'messages', component: () => import('../pages/admin/MessageAudit.vue') },
            { path: 'gallery', component: () => import('../pages/admin/GalleryManage.vue') },
            { path: 'config', component: () => import('../pages/admin/Config.vue') }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
