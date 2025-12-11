package com.baby100.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_table")
public class TableInfo {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer tableNo;
    private String title;
    private Integer maxSeats;
    private LocalDateTime createTime;
}

