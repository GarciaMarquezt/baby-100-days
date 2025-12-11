package com.baby100.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_message")
public class Message {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String guestName;
    private String content;
    private String image;
    private Integer status; // 0:待审核 1:通过
    private LocalDateTime createTime;
}

