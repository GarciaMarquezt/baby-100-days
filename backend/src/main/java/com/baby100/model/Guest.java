package com.baby100.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_guest")
public class Guest {
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    private String name;
    private String phone;
    private Integer adultCount;
    private Integer childCount;
    private Integer needHotel; // 0/1
    private Integer hotelCount;
    private Integer needPickup; // 0/1
    private String remarks;
    private Integer tableNo;
    private String source;
    
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

