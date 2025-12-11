package com.baby100.controller;

import com.baby100.common.Result;
import com.baby100.model.Guest;
import com.baby100.service.GuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guest")
public class GuestController {

    @Autowired
    private GuestService guestService;

    // 提交登记
    @PostMapping("/register")
    public Result<Integer> register(@RequestBody Guest guest) {
        if (guest.getName() == null || guest.getPhone() == null) {
            return Result.error(1001, "姓名和手机号必填");
        }
        boolean success = guestService.register(guest);
        if (success) {
            return Result.success(guest.getId());
        } else {
            return Result.error(500, "登记失败");
        }
    }

    // 查询登记信息
    @GetMapping("/query")
    public Result<Guest> query(@RequestParam String phone) {
        Guest guest = guestService.lambdaQuery().eq(Guest::getPhone, phone).one();
        if (guest != null) {
            return Result.success(guest);
        } else {
            return Result.error(2001, "未找到登记信息");
        }
    }
}

