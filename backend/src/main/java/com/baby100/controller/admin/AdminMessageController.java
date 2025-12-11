package com.baby100.controller.admin;

import com.baby100.common.Result;
import com.baby100.model.Message;
import com.baby100.service.MessageService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/message")
public class AdminMessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/list")
    public Result<IPage<Message>> list(@RequestParam(defaultValue = "1") Integer page,
                                       @RequestParam(defaultValue = "10") Integer size,
                                       @RequestParam(defaultValue = "0") Integer status) {
        Page<Message> pageParam = new Page<>(page, size);
        return Result.success(messageService.page(pageParam, new LambdaQueryWrapper<Message>()
                .eq(Message::getStatus, status)
                .orderByDesc(Message::getCreateTime)));
    }

    @PostMapping("/approve")
    public Result<Boolean> approve(@RequestBody Message message) {
        message.setStatus(1); // 设置为通过
        return Result.success(messageService.updateById(message));
    }

    @PostMapping("/delete")
    public Result<Boolean> delete(@RequestBody Message message) {
        return Result.success(messageService.removeById(message.getId()));
    }
}

