package com.baby100.controller;

import com.baby100.common.Result;
import com.baby100.model.Admin;
import com.baby100.service.AdminService;
import com.baby100.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody Admin admin) {
        Admin loginUser = adminService.login(admin.getUsername(), admin.getPassword());
        if (loginUser != null) {
            String token = jwtUtils.generateToken(loginUser.getUsername());
            return Result.success(Collections.singletonMap("token", token));
        }
        return Result.error(401, "用户名或密码错误");
    }
}
