package com.baby100.controller;

import com.baby100.common.Result;
import com.baby100.model.SystemConfig;
import com.baby100.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Autowired
    private ConfigService configService;

    // 获取所有配置（前端初始化用）
    @GetMapping("/info")
    public Result<Map<String, String>> info() {
        List<SystemConfig> list = configService.list();
        Map<String, String> map = list.stream()
                .collect(Collectors.toMap(SystemConfig::getConfigKey, SystemConfig::getConfigValue));
        return Result.success(map);
    }
}
