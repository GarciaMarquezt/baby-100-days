package com.baby100.service;

import com.baby100.mapper.AdminMapper;
import com.baby100.model.Admin;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class AdminService extends ServiceImpl<AdminMapper, Admin> {
    
    public Admin login(String username, String password) {
        // 实际项目中应使用加密密码对比
        return this.getOne(new LambdaQueryWrapper<Admin>()
                .eq(Admin::getUsername, username)
                .eq(Admin::getPassword, password));
    }
}

