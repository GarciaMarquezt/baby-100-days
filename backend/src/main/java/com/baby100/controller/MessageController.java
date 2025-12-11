package com.baby100.controller;

import com.baby100.common.Result;
import com.baby100.model.Message;
import com.baby100.service.MessageService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // 提交留言
    @PostMapping("/send")
    public Result<Boolean> send(@RequestBody Message message) {
        message.setStatus(0); // 默认未审核
        message.setCreateTime(java.time.LocalDateTime.now());
        return Result.success(messageService.save(message));
    }

    // 获取已审核留言列表（前台用）
    @GetMapping("/list")
    public Result<Page<Message>> list(@RequestParam(defaultValue = "1") Integer page,
                                      @RequestParam(defaultValue = "20") Integer size) {
        Page<Message> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Message::getStatus, 1)
               .orderByDesc(Message::getCreateTime);
        return Result.success(messageService.page(pageParam, wrapper));
    }
    
    // 获取所有留言（后台管理用）
    @GetMapping("/admin/list")
    public Result<Page<Message>> adminList(@RequestParam(defaultValue = "1") Integer page,
                                           @RequestParam(defaultValue = "20") Integer size) {
        Page<Message> pageParam = new Page<>(page, size);
        return Result.success(messageService.page(pageParam, new LambdaQueryWrapper<Message>().orderByDesc(Message::getCreateTime)));
    }

    // 审核留言
    @PostMapping("/admin/audit")
    public Result<Boolean> audit(@RequestBody Message message) {
        return Result.success(messageService.updateById(message));
    }
    
    // 删除留言
    @DeleteMapping("/admin/delete")
    public Result<Boolean> delete(@RequestParam Integer id) {
        return Result.success(messageService.removeById(id));
    }
}

