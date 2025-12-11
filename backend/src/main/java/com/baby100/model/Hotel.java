package com.baby100.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_hotel")
public class Hotel {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer guestId;
    private String roomNo;
    private String roomType;
    private LocalDateTime createTime;
}

