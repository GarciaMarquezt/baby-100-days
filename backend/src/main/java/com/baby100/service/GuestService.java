package com.baby100.service;

import com.baby100.mapper.GuestMapper;
import com.baby100.model.Guest;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class GuestService extends ServiceImpl<GuestMapper, Guest> {

    // 登记业务
    public boolean register(Guest guest) {
        // 简单查重：同一个手机号如果已存在，则更新
        LambdaQueryWrapper<Guest> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Guest::getPhone, guest.getPhone());
        Guest exist = this.getOne(wrapper);
        
        if (exist != null) {
            guest.setId(exist.getId());
            return this.updateById(guest);
        } else {
            return this.save(guest);
        }
    }
}

