package com.baby100.controller.admin;

import com.baby100.common.Result;
import com.baby100.model.Hotel;
import com.baby100.service.HotelService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/hotel")
public class AdminHotelController {

    @Autowired
    private HotelService hotelService;

    @GetMapping("/list")
    public Result<IPage<Hotel>> list(@RequestParam(defaultValue = "1") Integer page,
                                     @RequestParam(defaultValue = "20") Integer size) {
        Page<Hotel> pageParam = new Page<>(page, size);
        return Result.success(hotelService.page(pageParam, new LambdaQueryWrapper<Hotel>()
                .orderByDesc(Hotel::getCreateTime)));
    }
    
    // 分配房间
    @PostMapping("/assign")
    public Result<Boolean> assign(@RequestBody Hotel hotel) {
        return Result.success(hotelService.saveOrUpdate(hotel));
    }
    
    @PostMapping("/delete")
    public Result<Boolean> delete(@RequestBody Hotel hotel) {
        return Result.success(hotelService.removeById(hotel.getId()));
    }
}

