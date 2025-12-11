package com.baby100.service;

import com.baby100.mapper.ConfigMapper;
import com.baby100.model.SystemConfig;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class ConfigService extends ServiceImpl<ConfigMapper, SystemConfig> {
    
    public String getValue(String key) {
        SystemConfig config = this.getOne(new LambdaQueryWrapper<SystemConfig>()
                .eq(SystemConfig::getConfigKey, key));
        return config != null ? config.getConfigValue() : null;
    }
}

