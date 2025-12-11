package com.baby100.controller.admin;

import com.baby100.common.Result;
import com.baby100.model.Guest;
import com.baby100.service.GuestService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/guest")
public class AdminGuestController {

    @Autowired
    private GuestService guestService;

    @GetMapping("/list")
    public Result<IPage<Guest>> list(@RequestParam(defaultValue = "1") Integer page,
                                     @RequestParam(defaultValue = "10") Integer size,
                                     @RequestParam(required = false) String name) {
        Page<Guest> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Guest> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(name)) {
            wrapper.like(Guest::getName, name);
        }
        wrapper.orderByDesc(Guest::getCreateTime);
        return Result.success(guestService.page(pageParam, wrapper));
    }

    @PostMapping("/delete")
    public Result<Boolean> delete(@RequestBody Guest guest) {
        return Result.success(guestService.removeById(guest.getId()));
    }

    // 更新宾客信息（如分配桌号）
    @PostMapping("/update")
    public Result<Boolean> update(@RequestBody Guest guest) {
        return Result.success(guestService.updateById(guest));
    }
}
