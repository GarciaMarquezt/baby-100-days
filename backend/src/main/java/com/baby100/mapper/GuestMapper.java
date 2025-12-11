package com.baby100.mapper;

import com.baby100.model.Guest;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GuestMapper extends BaseMapper<Guest> {
    // MyBatis Plus 已经内置了 CRUD，无需手写 SQL
}

