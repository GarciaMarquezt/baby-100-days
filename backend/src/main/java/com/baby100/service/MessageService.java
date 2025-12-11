package com.baby100.service;

import com.baby100.mapper.MessageMapper;
import com.baby100.model.Message;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class MessageService extends ServiceImpl<MessageMapper, Message> {
}

