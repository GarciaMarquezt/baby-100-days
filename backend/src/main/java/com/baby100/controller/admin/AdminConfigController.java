package com.baby100.controller.admin;

import com.baby100.common.Result;
import com.baby100.model.SystemConfig;
import com.baby100.service.ConfigService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/config")
public class AdminConfigController {

    @Autowired
    private ConfigService configService;

    @PostMapping("/update")
    public Result<Boolean> update(@RequestBody Map<String, String> configs) {
        for (Map.Entry<String, String> entry : configs.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            
            // 查找是否存在
            SystemConfig exist = configService.getOne(new LambdaQueryWrapper<SystemConfig>()
                    .eq(SystemConfig::getConfigKey, key));
            
            if (exist != null) {
                exist.setConfigValue(value);
                configService.updateById(exist);
            } else {
                SystemConfig newConfig = new SystemConfig();
                newConfig.setConfigKey(key);
                newConfig.setConfigValue(value);
                configService.save(newConfig);
            }
        }
        return Result.success(true);
    }
}

