package com.baby100.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("t_config")
public class SystemConfig {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String configKey;
    private String configValue;
    private String remark;
}

